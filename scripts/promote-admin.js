/**
 * Promote user to GOD_MODE in the correct database (test)
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

const userEmail = 'socrates73@gmail.com';
const targetRole = 'GOD_MODE';

async function promoteToAdmin() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB (test database)...');
    
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
    
    const db = client.db('test');
    console.log('✅ Connected to test database');
    
    // Check av_users collection first
    const avUsersCollection = db.collection('av_users');
    console.log('\n🔍 Checking av_users collection...');
    
    const avUser = await avUsersCollection.findOne({ email: userEmail });
    if (avUser) {
      console.log('✅ Found user in av_users:', avUser.name || avUser.email);
      console.log('📋 Current role:', avUser.role || 'Not set');
      
      const updateResult = await avUsersCollection.updateOne(
        { email: userEmail },
        { 
          $set: { 
            role: targetRole,
            industryType: 'OTHER',
            accountStatus: 'ACTIVE',
            hasAccess: true,
            updatedAt: new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`🎉 Successfully promoted ${userEmail} to ${targetRole} in av_users!`);
      }
      
      const updatedUser = await avUsersCollection.findOne({ email: userEmail });
      console.log('✅ Updated av_users data:', {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
        hasAccess: updatedUser.hasAccess
      });
    }
    
    // Also check the regular users collection 
    const usersCollection = db.collection('users');
    console.log('\n🔍 Checking users collection...');
    
    const regularUser = await usersCollection.findOne({ email: userEmail });
    if (regularUser) {
      console.log('✅ Found user in users collection:', regularUser.name || regularUser.email);
      console.log('📋 Current role:', regularUser.role || 'Not set');
      
      const updateResult = await usersCollection.updateOne(
        { email: userEmail },
        { 
          $set: { 
            role: targetRole,
            industryType: 'OTHER',
            accountStatus: 'ACTIVE',
            hasAccess: true,
            updatedAt: new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`🎉 Successfully promoted ${userEmail} to ${targetRole} in users collection!`);
      }
      
      const updatedUser = await usersCollection.findOne({ email: userEmail });
      console.log('✅ Updated users data:', {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
        hasAccess: updatedUser.hasAccess
      });
    }
    
    console.log('\n🎯 Summary:');
    console.log('- User has been promoted to GOD_MODE in both collections');
    console.log('- Please refresh your browser and log out/in to see admin features');
    console.log('- You should now see Admin and Customer navigation links');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected');
    }
  }
}

promoteToAdmin();
