import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../libs/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const size = searchParams.get('size') || '';
    const sortBy = searchParams.get('sortBy') || 'createdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const hubspot = new HubSpotService();
    
    const filters = [];
    
    if (search) {
      filters.push({
        propertyName: 'name',
        operator: 'CONTAINS_TOKEN',
        value: search
      });
    }
    
    if (industry) {
      filters.push({
        propertyName: 'industry',
        operator: 'EQ',
        value: industry
      });
    }
    
    if (size) {
      filters.push({
        propertyName: 'numberofemployees',
        operator: 'EQ',
        value: size
      });
    }

    let companies;
    try {
      companies = await hubspot.searchCompanies({
        filters,
        properties: [
          'name', 'domain', 'industry', 'numberofemployees', 'annualrevenue',
          'city', 'state', 'country', 'phone', 'createdate', 'lastmodifieddate',
          'hubspotscore', 'lifecyclestage', 'hs_lead_status', 'type'
        ],
        sorts: [{
          propertyName: sortBy,
          direction: sortOrder.toUpperCase()
        }],
        offset: (page - 1) * limit,
        limit
      });
    } catch (hubspotError) {
      console.error('HubSpot API Error:', hubspotError);
      // Return empty results if HubSpot API fails
      return NextResponse.json({
        companies: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false
        },
        error: 'HubSpot API temporarily unavailable'
      });
    }

    const companiesWithDetails = await Promise.allSettled(
      companies.results.map(async (company: any) => {
        try {
          const [contacts, deals, tickets] = await Promise.all([
            hubspot.getCompanyContacts(company.id, 5),
            hubspot.getCompanyDeals(company.id),
            hubspot.getCompanyTickets(company.id)
          ]);
          
          return {
            id: company.id,
            properties: company.properties,
            contactCount: contacts.length,
            dealCount: deals.length,
            ticketCount: tickets.length,
            totalRevenue: deals.reduce((sum: number, deal: any) => 
              sum + (parseFloat(deal.properties.amount) || 0), 0),
            recentContacts: contacts.slice(0, 3),
            displayName: company.properties.name || company.properties.domain,
            employeeCount: parseInt(company.properties.numberofemployees) || 0,
            annualRevenue: parseFloat(company.properties.annualrevenue) || 0,
            leadScore: parseInt(company.properties.hubspotscore) || 0
          };
        } catch (error) {
          console.error(`Error fetching details for company ${company.id}:`, error);
          return {
            id: company.id,
            properties: company.properties,
            contactCount: 0,
            dealCount: 0,
            ticketCount: 0,
            totalRevenue: 0,
            recentContacts: [],
            displayName: company.properties.name || company.properties.domain,
            employeeCount: parseInt(company.properties.numberofemployees) || 0,
            annualRevenue: parseFloat(company.properties.annualrevenue) || 0,
            leadScore: parseInt(company.properties.hubspotscore) || 0
          };
        }
      })
    );

    const successfulCompanies = companiesWithDetails
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);

    return NextResponse.json({
      companies: successfulCompanies,
      pagination: {
        page,
        limit, 
        total: companies.total,
        totalPages: Math.ceil(companies.total / limit),
        hasNext: companies.paging?.next?.after
      }
    });
  } catch (error) {
    console.error('Companies API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyData = await request.json();
    const hubspot = new HubSpotService();

    const company = await hubspot.createCompany({
      properties: {
        name: companyData.name,
        domain: companyData.domain,
        industry: companyData.industry,
        numberofemployees: companyData.numberofemployees?.toString(),
        annualrevenue: companyData.annualrevenue?.toString(),
        city: companyData.city,
        state: companyData.state,
        country: companyData.country,
        phone: companyData.phone,
        description: companyData.description,
        lifecyclestage: companyData.lifecycleStage || 'lead',
        hs_lead_status: companyData.leadStatus || 'NEW',
        type: companyData.type || 'PROSPECT'
      }
    });

    // Track company creation event
    await hubspot.trackEvent({
      eventName: 'company_created_via_admin',
      companyId: company.id,
      properties: {
        created_by: session.user.email,
        creation_method: 'admin_dashboard'
      }
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Create Company API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
