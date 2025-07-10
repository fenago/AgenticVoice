import { NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import DemoRequest from '@/models/DemoRequest';

export async function GET() {
  try {
    // Connect to the database
    await connectMongo();
    
    // Get all demo requests
    const demoRequests = await DemoRequest.find({}).sort({ createdAt: -1 });
    
    // Return the demo requests
    return NextResponse.json({ success: true, data: demoRequests });
  } catch (error) {
    console.error('Error fetching demo requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch demo requests' },
      { status: 500 }
    );
  }
}
