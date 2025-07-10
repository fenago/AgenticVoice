const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    // Extract database name from URI
    const dbName = uri.split('/').pop().split('?')[0];
    console.log('Database name from URI:', dbName);
    
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    
    console.log('\nAll collections in database:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check for av_ collections
    const avCollections = collections.filter(col => col.name.startsWith('av_'));
    console.log(`\nFound ${avCollections.length} av_ collections`);
    
    // Check if av_demo_requests exists
    const hasDemoRequests = collections.some(col => col.name === 'av_demo_requests');
    console.log(`\nav_demo_requests exists: ${hasDemoRequests}`);
    
    if (!hasDemoRequests) {
      console.log('\nThe av_demo_requests collection will be created when the first form is submitted.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabase();
