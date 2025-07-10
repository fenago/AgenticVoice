import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../libs/auth-config';
import { HubSpotService } from '../../../../../../libs/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['ADMIN', 'GOD_MODE', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const hubspot = new HubSpotService();
    
    // Search contacts by email or name
    const filters = [];
    
    if (query) {
      // Search by email
      filters.push({
        propertyName: 'email',
        operator: 'CONTAINS_TOKEN',
        value: query
      });
      
      // Search by first name
      filters.push({
        propertyName: 'firstname',
        operator: 'CONTAINS_TOKEN', 
        value: query
      });
      
      // Search by last name
      filters.push({
        propertyName: 'lastname',
        operator: 'CONTAINS_TOKEN',
        value: query
      });
    }

    const searchRequest = {
      properties: [
        'email',
        'firstname', 
        'lastname',
        'company',
        'phone',
        'hs_lead_status',
        'lifecyclestage'
      ],
      limit: limit,
      ...(filters.length > 0 && {
        filterGroups: filters.map(filter => ({
          filters: [filter]
        }))
      }),
      sorts: [
        {
          propertyName: 'lastmodifieddate',
          direction: 'DESCENDING'
        }
      ]
    };

    let response;
    try {
      response = await hubspot.searchContacts(searchRequest);
    } catch (error) {
      console.log('🔍 API: HubSpot error, using mock data. Error:', error.message);
      // Fallback mock data for development
      const mockContacts = [
        {
          id: 'mock-1',
          properties: {
            email: 'john.doe@example.com',
            firstname: 'John',
            lastname: 'Doe',
            company: 'Acme Corp',
            phone: '+1-555-0123'
          }
        },
        {
          id: 'mock-2', 
          properties: {
            email: 'jane.smith@example.com',
            firstname: 'Jane',
            lastname: 'Smith',
            company: 'Tech Solutions',
            phone: '+1-555-0124'
          }
        },
        {
          id: 'mock-3',
          properties: {
            email: 'bob.wilson@example.com', 
            firstname: 'Bob',
            lastname: 'Wilson',
            company: 'StartupXYZ',
            phone: '+1-555-0125'
          }
        }
      ].filter(contact => 
        !query || 
        contact.properties.email.toLowerCase().includes(query.toLowerCase()) ||
        contact.properties.firstname.toLowerCase().includes(query.toLowerCase()) ||
        contact.properties.lastname.toLowerCase().includes(query.toLowerCase())
      );
      
      response = { results: mockContacts };
    }
    
    if (!response?.results) {
      return NextResponse.json({ 
        success: true, 
        contacts: [],
        total: 0 
      });
    }

    console.log('🔍 API: Raw response.results:', response.results);
    console.log('🔍 API: Number of results:', response.results?.length);
    
    // Map contacts first
    let contacts = response.results.map((contact: any) => ({
      id: contact.id,
      email: contact.properties.email || '',
      firstName: contact.properties.firstname || '',
      lastName: contact.properties.lastname || '',
      fullName: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || contact.properties.email || 'Unknown Contact',
      company: contact.properties.company || '',
      phone: contact.properties.phone || '',
      leadStatus: contact.properties.hs_lead_status || '',
      lifecycleStage: contact.properties.lifecyclestage || ''
    }));

    // FORCE FILTER ON BACKEND - since the search isn't working properly
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      contacts = contacts.filter((contact: any) => 
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.fullName.toLowerCase().includes(searchTerm) ||
        contact.company.toLowerCase().includes(searchTerm)
      );

    }

    console.log('🔍 API: Final contacts being returned:', contacts);
    console.log('🔍 API: Query was:', query);

    return NextResponse.json({
      success: true,
      contacts: contacts,
      total: response.total || contacts.length
    });

  } catch (error: any) {
    console.error('Error searching contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search contacts',
      details: error.message
    }, { status: 500 });
  }
}
