/**
 * Script to promote a user to GOD_MODE admin role
 * Usage: node scripts/make-admin.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const userEmail = 'socrates73@gmail.com';
const targetRole = 'GOD_MODE';

// Simple .env file parser
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return env;
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    return {};
  }
}

async function makeAdmin() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Load environment variables
    const env = loadEnv();
    let mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('💡 Make sure your .env file contains MONGODB_URI=your_connection_string');
      return;
    }
    
    // Clean up the URI and add database name if not present
    mongoUri = mongoUri.replace(/\?$/, ''); // Remove trailing ?
    if (!mongoUri.includes('/agenticvoice')) {
      mongoUri = mongoUri.replace('/?', '/agenticvoice?');
      if (!mongoUri.includes('?')) {
        mongoUri = mongoUri.replace('mongodb.net/', 'mongodb.net/agenticvoice?');
      }
    }
    
    console.log('🔗 Using database: agenticvoice');
    
    // Connect to MongoDB using the connection string from .env
    client = new MongoClient(mongoUri);
    await client.connect();
    
    const db = client.db('agenticvoice');
    const usersCollection = db.collection('av_users');
    
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Find the user first
    const existingUser = await usersCollection.findOne({ email: userEmail });
    
    if (!existingUser) {
      console.log(`❌ User ${userEmail} not found in database`);
      console.log('💡 Make sure you have logged in at least once to create the user record');
      
      // Let's check what users exist
      const allUsers = await usersCollection.find({}).limit(5).toArray();
      console.log(`📊 Found ${allUsers.length} users in database:`);
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role || 'FREE'})`);
      });
      
      return;
    }
    
    console.log(`✅ Found user: ${existingUser.name || existingUser.email}`);
    console.log(`📋 Current role: ${existingUser.role || 'FREE'}`);
    
    // Update the user role to GOD_MODE
    const updateResult = await usersCollection.updateOne(
      { email: userEmail },
      { 
        $set: { 
          role: targetRole,
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.modifiedCount === 1) {
      console.log(`🎉 Successfully promoted ${userEmail} to ${targetRole}!`);
      console.log('🔄 Please refresh your browser and log out/in to see the changes');
    } else {
      console.log(`⚠️  No changes made. User might already have ${targetRole} role.`);
    }
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ email: userEmail });
    console.log(`✅ Confirmed role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('💡 Make sure MONGODB_URI is set in your .env file');
    }
    
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Execute the script
makeAdmin().catch(console.error);
