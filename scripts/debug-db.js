/**
 * Debug database connections and find where user data is stored
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function debugDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB cluster...');
    
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    console.log('✅ Connected successfully');
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n📚 Available databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check common database names
    const possibleDbs = ['agenticvoice', 'test', 'admin', 'agentic-voice', 'AgenticVoice'];
    
    for (const dbName of possibleDbs) {
      console.log(`\n🔍 Checking database: ${dbName}`);
      try {
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        
        if (collections.length > 0) {
          console.log(`  Collections in ${dbName}:`);
          for (const col of collections) {
            console.log(`    - ${col.name}`);
            
            // Check for user-related collections
            if (col.name.includes('user') || col.name.includes('User') || col.name.includes('av_')) {
              const collection = db.collection(col.name);
              const count = await collection.countDocuments();
              console.log(`      → ${count} documents`);
              
              if (count > 0) {
                const samples = await collection.find({}).limit(3).toArray();
                samples.forEach(doc => {
                  if (doc.email) {
                    console.log(`        • ${doc.email} - ${doc.name || 'No name'}`);
                  }
                });
              }
            }
          }
        } else {
          console.log(`  No collections in ${dbName}`);
        }
      } catch (error) {
        console.log(`  ❌ Error accessing ${dbName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected');
    }
  }
}

debugDatabase();
