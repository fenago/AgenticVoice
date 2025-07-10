/**
 * Find user in MongoDB collections
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/agenticvoice?retryWrites=true&w=majority&appName=Cluster0';

async function findUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ Connected successfully!');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check different possible user collections
    const possibleCollections = ['users', 'av_users', 'User', 'user'];
    const userEmail = 'socrates73@gmail.com';
    
    for (const collectionName of possibleCollections) {
      try {
        console.log(`\n🔍 Checking collection: ${collectionName}`);
        const collection = mongoose.connection.db.collection(collectionName);
        const users = await collection.find({}).limit(5).toArray();
        
        console.log(`  Found ${users.length} documents`);
        
        if (users.length > 0) {
          console.log('  Sample documents:');
          users.forEach(user => {
            console.log(`    - ${user.email || user._id} (${user.role || 'No role'}) - ${user.name || 'No name'}`);
          });
          
          // Look for our specific user
          const targetUser = await collection.findOne({ email: userEmail });
          if (targetUser) {
            console.log(`\n🎯 FOUND TARGET USER in ${collectionName}:`);
            console.log('    Email:', targetUser.email);
            console.log('    Name:', targetUser.name);
            console.log('    Role:', targetUser.role);
            console.log('    Created:', targetUser.createdAt);
            console.log('    Updated:', targetUser.updatedAt);
            
            // Update the user role
            const result = await collection.updateOne(
              { email: userEmail },
              { 
                $set: { 
                  role: 'GOD_MODE',
                  updatedAt: new Date()
                }
              }
            );
            
            if (result.modifiedCount > 0) {
              console.log('🎉 Successfully promoted to GOD_MODE!');
            } else {
              console.log('⚠️ No changes made');
            }
            
            // Verify update
            const updatedUser = await collection.findOne({ email: userEmail });
            console.log('✅ Confirmed role:', updatedUser.role);
          }
        }
      } catch (error) {
        console.log(`  ❌ Error checking ${collectionName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

findUser();
