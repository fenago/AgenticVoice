const mongoose = require('mongoose');
require('dotenv').config();

async function verifyDemoData() {
  try {
    console.log('🔍 Checking for demo requests in MongoDB...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📍 Connected to database: ${dbName}`);
    
    // Check if av_demo_requests collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`\n📋 Collections in ${dbName}:`, collectionNames.join(', '));
    
    // Get demo requests
    const DemoRequest = mongoose.connection.db.collection('av_demo_requests');
    const count = await DemoRequest.countDocuments();
    console.log(`\n✅ Found ${count} demo request(s) in av_demo_requests`);
    
    if (count > 0) {
      const docs = await DemoRequest.find({}).limit(5).toArray();
      console.log('\n📄 Recent demo requests:');
      docs.forEach((doc, index) => {
        console.log(`\n${index + 1}. Demo Request:`);
        console.log(`   Name: ${doc.name}`);
        console.log(`   Email: ${doc.email}`);
        console.log(`   Phone: ${doc.phone}`);
        console.log(`   Practice Type: ${doc.practiceType}`);
        console.log(`   Preferred Time: ${doc.preferredTime}`);
        console.log(`   Created: ${doc.createdAt}`);
        console.log(`   ID: ${doc._id}`);
      });
    }
    
    console.log('\n\n🌐 TO VIEW IN MONGODB ATLAS:');
    console.log(`1. Go to your MongoDB Atlas dashboard`);
    console.log(`2. Click on "Browse Collections"`);
    console.log(`3. Select database: "${dbName}"`);
    console.log(`4. Look for collection: "av_demo_requests"`);
    console.log(`5. You should see ${count} document(s) there`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyDemoData();
