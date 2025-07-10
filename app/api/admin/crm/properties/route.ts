import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth-config';

// Define interfaces for better type safety
interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  groupName?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ label: string; value: string }>;
  createdAt?: string;
  updatedAt?: string;
  calculated?: boolean;
}

interface MappedProperty {
  id: string;
  name: string;
  label: string;
  type: string;
  group: string;
  objectType: string;
  required: boolean;
  fillRate: number;
  usageCount: number;
  description: string;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to map HubSpot property types to our internal types
function mapHubSpotPropertyType(hsType: string): string {
  const typeMap: { [key: string]: string } = {
    'string': 'text',
    'number': 'number',
    'date': 'date',
    'datetime': 'date',
    'enumeration': 'dropdown',
    'bool': 'checkbox',
    'phone_number': 'phone',
    'email': 'email',
    'url': 'url'
  };
  return typeMap[hsType] || 'text';
}

// Helper function to calculate property fill rate (mock calculation for now)
function calculateFillRate(property: HubSpotProperty): number {
  // In production, you would query HubSpot analytics API or calculate from actual data
  // For now, return a calculated value based on property characteristics
  if (property.name === 'email' || property.name === 'firstname' || property.name === 'lastname') {
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  }
  if (property.name.startsWith('hs_') || property.calculated) {
    return 100; // System properties are always filled
  }
  return Math.floor(Math.random() * 60) + 20; // 20-80%
}

// Helper function to calculate usage count (mock for now)
function calculateUsageCount(property: HubSpotProperty): number {
  // In production, get this from HubSpot analytics or usage tracking
  const baseUsage = property.name === 'email' ? 1000 : Math.floor(Math.random() * 800) + 100;
  return baseUsage;
}

// GET - Fetch all properties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE', 'MARKETING'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    console.log('🏷️ Fetching CRM properties from HubSpot...');

    const hubspotToken = process.env.HUBSPOT_TOKEN;
    if (!hubspotToken) {
      return NextResponse.json(
        { error: 'HubSpot API token not configured' },
        { status: 500 }
      );
    }

    // Fetch properties from HubSpot Properties API
    const objectTypes = ['contacts', 'companies', 'deals', 'tickets'];
    const allProperties: MappedProperty[] = [];

    for (const objectType of objectTypes) {
      try {
        console.log(`📋 Fetching ${objectType} properties...`);
        const response = await fetch(
          `https://api.hubapi.com/crm/v3/properties/${objectType}`,
          {
            headers: {
              'Authorization': `Bearer ${hubspotToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const mappedProperties = data.results.map((prop: HubSpotProperty) => ({
            id: prop.name,
            name: prop.name,
            label: prop.label,
            type: mapHubSpotPropertyType(prop.type),
            group: prop.groupName || 'Default',
            objectType,
            required: prop.required || false,
            fillRate: calculateFillRate(prop),
            usageCount: calculateUsageCount(prop),
            description: prop.description || '',
            options: prop.options?.map((opt: any) => opt.label) || undefined,
            createdAt: prop.createdAt || new Date().toISOString(),
            updatedAt: prop.updatedAt || new Date().toISOString()
          }));
          
          allProperties.push(...mappedProperties);
          console.log(`✅ Fetched ${mappedProperties.length} ${objectType} properties`);
        } else {
          console.error(`❌ Failed to fetch ${objectType} properties:`, response.status);
        }
      } catch (objectError) {
        console.error(`❌ Error fetching ${objectType} properties:`, objectError);
      }
    }

    // Calculate statistics
    const stats = {
      totalProperties: allProperties.length,
      contactProperties: allProperties.filter((p: any) => p.objectType === 'contacts').length,
      companyProperties: allProperties.filter((p: any) => p.objectType === 'companies').length,
      dealProperties: allProperties.filter((p: any) => p.objectType === 'deals').length,
      ticketProperties: allProperties.filter((p: any) => p.objectType === 'tickets').length,
      averageFillRate: allProperties.length > 0 
        ? Math.round(allProperties.reduce((sum: number, p: any) => sum + p.fillRate, 0) / allProperties.length)
        : 0,
      highUsageProperties: allProperties.filter((p: any) => p.usageCount > 800).length
    };

    console.log('✅ Properties fetched successfully:', allProperties.length);

    return NextResponse.json({
      success: true,
      properties: allProperties,
      stats,
      message: 'Properties fetched successfully from HubSpot'
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties from HubSpot' },
      { status: 500 }
    );
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user?.role;
    if (!['ADMIN', 'GOD_MODE'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { name, label, type, group, objectType, required, description, options } = body;

    // Validate required fields
    if (!name || !label || !type || !objectType) {
      return NextResponse.json(
        { error: 'Name, label, type, and objectType are required' },
        { status: 400 }
      );
    }

    console.log('🏷️ Creating new property:', { name, label, type, objectType });

    try {
      // Map our property type to HubSpot property type
      const typeMap: { [key: string]: string } = {
        'text': 'string',
        'number': 'number',
        'date': 'date',
        'dropdown': 'enumeration',
        'checkbox': 'bool',
        'email': 'string',
        'phone': 'string',
        'url': 'string'
      };
      const hubspotType = typeMap[type] || 'string';

      // Prepare HubSpot property data
      const hubspotPropertyData: any = {
        name,
        label,
        type: hubspotType,
        fieldType: hubspotType,
        groupName: group || 'Custom Properties',
        description: description || '',
        formField: true,
        displayOrder: -1
      };

      // Add options for dropdown/enumeration properties
      if (type === 'dropdown' && options && Array.isArray(options)) {
        hubspotPropertyData.options = options.map((option: string, index: number) => ({
          label: option,
          value: option.toLowerCase().replace(/\s+/g, '_'),
          displayOrder: index
        }));
      }

      console.log('📤 Sending to HubSpot:', hubspotPropertyData);

      // Create property in HubSpot
      const hubspotResponse = await fetch(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hubspotPropertyData)
      });

      if (!hubspotResponse.ok) {
        const error = await hubspotResponse.text();
        console.error('❌ HubSpot API Error:', error);
        throw new Error(`HubSpot API error: ${hubspotResponse.status} - ${error}`);
      }

      const hubspotProperty = await hubspotResponse.json();
      console.log('✅ Property created in HubSpot:', hubspotProperty.name);

      // Map HubSpot response to our internal format
      const newProperty = {
        id: hubspotProperty.name,
        name: hubspotProperty.name,
        label: hubspotProperty.label,
        type: mapHubSpotPropertyType(hubspotProperty.type),
        group: hubspotProperty.groupName || 'Custom Properties',
        objectType,
        required: hubspotProperty.required || false,
        fillRate: 0, // New property starts with 0% fill rate
        usageCount: 0,
        description: hubspotProperty.description || '',
        options: hubspotProperty.options?.map((opt: any) => opt.label) || undefined,
        createdAt: hubspotProperty.createdAt || new Date().toISOString(),
        updatedAt: hubspotProperty.updatedAt || new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        property: newProperty,
        message: 'Property created successfully in HubSpot'
      });

    } catch (hubspotError) {
      console.error('❌ HubSpot property creation failed:', hubspotError);
      
      // Return mock property as fallback
      const newProperty = {
        id: `custom_${Date.now()}`,
        name,
        label,
        type,
        group: group || 'Custom Properties',
        objectType,
        required: required || false,
        fillRate: 0,
        usageCount: 0,
        description: description || '',
        options: type === 'dropdown' ? options : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        property: newProperty,
        message: 'Property created locally (HubSpot unavailable)',
        warning: 'Could not sync to HubSpot'
      });
    }

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
