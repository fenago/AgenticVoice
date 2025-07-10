const mongoose = require('mongoose');
require('dotenv').config();

async function verifyCollections() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the database name from the connection
    const dbName = mongoose.connection.db.databaseName;
    console.log('\n📍 Current Database:', dbName);
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 All Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check specifically for av_ collections
    const avCollections = collections.filter(col => col.name.startsWith('av_'));
    console.log('\n🔍 AgenticVoice Collections (av_*):', avCollections.length);
    avCollections.forEach(col => {
      console.log(`  ✓ ${col.name}`);
    });
    
    // Check if av_demo_requests exists
    const demoRequestsExists = collections.some(col => col.name === 'av_demo_requests');
    if (demoRequestsExists) {
      console.log('\n✅ av_demo_requests collection EXISTS');
      
      // Count documents in av_demo_requests
      const count = await mongoose.connection.db.collection('av_demo_requests').countDocuments();
      console.log(`   Documents in av_demo_requests: ${count}`);
      
      // Show a sample document if any exist
      if (count > 0) {
        const sample = await mongoose.connection.db.collection('av_demo_requests').findOne();
        console.log('\n   Sample document:');
        console.log(JSON.stringify(sample, null, 2));
      }
    } else {
      console.log('\n❌ av_demo_requests collection does NOT exist yet');
      console.log('   It will be created automatically when the first demo request is submitted');
    }
    
    // Show MongoDB Atlas instructions
    console.log('\n📌 To view in MongoDB Atlas:');
    console.log(`   1. Go to your MongoDB Atlas dashboard`);
    console.log(`   2. Navigate to Database > Browse Collections`);
    console.log(`   3. Select database: "${dbName}"`);
    console.log(`   4. Look for collections starting with "av_"`);
    console.log(`   5. The av_demo_requests collection will appear after first submission`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

verifyCollections();
