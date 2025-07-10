// Simple database connection test
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db('test');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check for AgenticVoice specific collections
    const avCollections = collections.filter(c => c.name.startsWith('av_'));
    console.log(`\nAgenticVoice collections (av_*): ${avCollections.length}`);
    avCollections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    if (avCollections.includes('av_users')) {
      const usersCollection = db.collection('av_users');
      const userCount = await usersCollection.countDocuments();
      console.log(`\nav_users collection has ${userCount} users`);
      
      if (userCount > 0) {
        const sampleUser = await usersCollection.findOne({});
        console.log('Sample user structure:', {
          _id: sampleUser._id,
          name: sampleUser.name,
          email: sampleUser.email,
          role: sampleUser.role,
          accountStatus: sampleUser.accountStatus
        });
      }
    }
    
    console.log('\n🎉 Database validation complete - ready for admin development!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed.');
    }
  }
}

testConnection();
