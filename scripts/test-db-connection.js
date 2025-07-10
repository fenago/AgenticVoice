/**
 * Test Database Connection Script
 * Run this to verify MongoDB connection is working
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const testConnection = async () => {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }
  
  console.log('📍 MongoDB URI found');
  console.log('🔗 Attempting connection...\n');
  
  try {
    const connection = await mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Connection state: ${mongoose.connections[0].readyState}`);
    console.log(`🏛️  Database name: ${connection.connection.name}`);
    console.log(`🌐 Host: ${connection.connection.host}`);
    console.log(`🔌 Port: ${connection.connection.port}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📝 Available collections:');
      collections.forEach(col => console.log(`   - ${col.name}`));
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check if your MongoDB URI is correct');
      console.log('2. Verify network connectivity');
      console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
      console.log('4. Check if MongoDB cluster is running');
    }
    
    process.exit(1);
  }
};

testConnection();
