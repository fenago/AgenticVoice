import { NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    await connectMongo();
    
    if (mongoose.connection.readyState === 1) {
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection successful',
        status: 'Connected',
        database: mongoose.connection.db?.databaseName || 'agenticvoice',
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : []
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to MongoDB',
        status: 'Disconnected'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      status: 'Error'
    }, { status: 500 });
  }
}
