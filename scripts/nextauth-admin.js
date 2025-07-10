/**
 * Admin script using NextAuth's MongoDB connection approach
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/agenticvoice?retryWrites=true&w=majority&appName=Cluster0';

const userEmail = 'socrates73@gmail.com';
const targetRole = 'GOD_MODE';

async function makeAdminNextAuth() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB (NextAuth style)...');
    
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
    
    const db = client.db();
    console.log('✅ Connected to database:', db.databaseName);
    
    // Check all collections starting with av_
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check av_users collection (NextAuth users)
    const usersCollection = db.collection('av_users');
    
    console.log('\n🔍 Checking av_users collection...');
    const allUsers = await usersCollection.find({}).limit(10).toArray();
    console.log(`Found ${allUsers.length} users:`);
    
    allUsers.forEach(user => {
      console.log(`  - ${user.email || user._id} - ${user.name || 'No name'}`);
    });
    
    // Look for our specific user
    console.log(`\n🎯 Looking for user: ${userEmail}`);
    const targetUser = await usersCollection.findOne({ email: userEmail });
    
    if (targetUser) {
      console.log('✅ Found user:', targetUser.name || targetUser.email);
      console.log('📋 Current data:', {
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role || 'Not set',
        image: targetUser.image,
        emailVerified: targetUser.emailVerified,
        createdAt: targetUser.createdAt || 'Not set',
        updatedAt: targetUser.updatedAt || 'Not set'
      });
      
      // Update the user to add role and other fields
      const updateResult = await usersCollection.updateOne(
        { email: userEmail },
        { 
          $set: { 
            role: targetRole,
            industryType: 'OTHER',
            accountStatus: 'ACTIVE',
            hasAccess: true,
            updatedAt: new Date(),
            createdAt: targetUser.createdAt || new Date()
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`🎉 Successfully promoted ${userEmail} to ${targetRole}!`);
      } else {
        console.log('⚠️ No changes made (already up to date?)');
      }
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ email: userEmail });
      console.log('\n✅ Updated user data:', {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
        hasAccess: updatedUser.hasAccess,
        updatedAt: updatedUser.updatedAt
      });
      
    } else {
      console.log(`❌ User ${userEmail} not found in av_users collection`);
      
      if (allUsers.length === 0) {
        console.log('💡 The av_users collection is empty. Please log in to the app first.');
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

makeAdminNextAuth();
