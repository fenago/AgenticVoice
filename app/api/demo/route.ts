import { NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import DemoRequest from '@/models/DemoRequest';

export async function POST(req: Request) {
  console.log('=== DEMO API ROUTE CALLED ===');
  
  try {
    // Connect to the database
    console.log('Attempting to connect to MongoDB...');
    await connectMongo();
    console.log('✅ Connected to MongoDB');
    
    // Get request data
    const data = await req.json();
    console.log('📥 Received data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'practiceType', 'preferredTime', 'agreeToTerms'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    console.log('✅ All required fields present');
    
    // Create a new demo request in the database
    console.log('Creating demo request in database...');
    const demoRequest = await DemoRequest.create(data);
    console.log('✅ Demo request created:', demoRequest._id);
    
    // Send data to n8n webhook
    console.log('Sending data to n8n webhook...');
    try {
      // Map time slot values to readable format
      const timeSlotMap: { [key: string]: string } = {
        'morning': 'Morning (9am - 12pm)',
        'afternoon': 'Afternoon (1pm - 5pm)',
        'custom': 'Request a custom time'
      };
      
      // Map practice types to readable format
      const practiceTypeMap: { [key: string]: string } = {
        'medical-primary': 'Medical - Primary Care',
        'medical-specialty': 'Medical - Specialty',
        'dental': 'Dental',
        'legal-general': 'Legal - General Practice',
        'legal-specialty': 'Legal - Specialty',
        'other': 'Other'
      };
      
      const n8nPayload = {
        full_name: data.name,
        email: data.email,
        phone_number: data.phone,
        practice_type: practiceTypeMap[data.practiceType] || data.practiceType,
        preferred_time_slot: timeSlotMap[data.preferredTime] || data.preferredTime,
        additional_information: data.message || '',
        privacy_policy_agreed: data.agreeToTerms
      };
      
      console.log('n8n payload:', JSON.stringify(n8nPayload, null, 2));
      
      const n8nResponse = await fetch('https://fenago.app.n8n.cloud/webhook/lead-intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      });
      
      if (!n8nResponse.ok) {
        console.error('❌ n8n webhook returned error:', n8nResponse.status, n8nResponse.statusText);
        // Don't throw error - continue with success even if webhook fails
      } else {
        console.log('✅ Data sent to n8n webhook successfully');
      }
    } catch (webhookError) {
      console.error('❌ Error sending to n8n webhook:', webhookError);
      // Don't throw error - continue with success even if webhook fails
    }
    
    // Return success response with the created demo request
    return NextResponse.json(
      { 
        success: true, 
        message: 'Demo request submitted successfully', 
        data: demoRequest 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error in demo API route:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit demo request', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
