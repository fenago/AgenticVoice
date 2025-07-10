/**
 * Simple script to promote a user to GOD_MODE admin role
 * Usage: node scripts/make-admin-simple.js
 */

const mongoose = require('mongoose');
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

// User schema - simplified version
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  role: { type: String, default: 'FREE' },
  industryType: { type: String, default: 'OTHER' },
  accountStatus: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'av_users' // Use the correct collection name
});

async function makeAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB with Mongoose...');
    
    // Load environment variables
    const env = loadEnv();
    let mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      return;
    }
    
    // Clean up the URI to handle malformed query parameters
    console.log('🔧 Cleaning MongoDB URI...');
    
    // Remove any trailing empty query parameters that cause "options with no value" error
    mongoUri = mongoUri.replace(/\?$/, ''); // Remove trailing ?
    mongoUri = mongoUri.replace(/&$/, ''); // Remove trailing &
    mongoUri = mongoUri.replace(/\?&/, '?'); // Replace ?& with ?
    mongoUri = mongoUri.replace(/&&+/g, '&'); // Replace multiple && with single &
    
    console.log('🔗 Connecting to AgenticVoice database...');
    
    // Connect using mongoose (like the app does)
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📋 Using collection: av_users (with av_ prefix for safety)');
    
    // Create the User model
    const User = mongoose.model('User', userSchema);
    
    console.log(`🔍 Looking for user: ${userEmail}`);
    
    // Find the user first
    const existingUser = await User.findOne({ email: userEmail });
    
    if (!existingUser) {
      console.log(`❌ User ${userEmail} not found in av_users collection`);
      console.log('💡 Make sure you have logged in at least once to create the user record');
      
      // Let's check what users exist
      const allUsers = await User.find({}).limit(5);
      console.log(`📊 Found ${allUsers.length} users in av_users collection:`);
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role || 'FREE'})`);
      });
      
      if (allUsers.length === 0) {
        console.log('💡 The av_users collection appears to be empty. Please log in to the app first.');
      }
      
      return;
    }
    
    console.log(`✅ Found user: ${existingUser.name || existingUser.email}`);
    console.log(`📋 Current role: ${existingUser.role || 'FREE'}`);
    
    // Update the user role to GOD_MODE
    const updateResult = await User.updateOne(
      { email: userEmail },
      { 
        role: targetRole,
        updatedAt: new Date()
      }
    );
    
    if (updateResult.modifiedCount === 1) {
      console.log(`🎉 Successfully promoted ${userEmail} to ${targetRole}!`);
      console.log('🔄 Please refresh your browser and log out/in to see the changes');
    } else {
      console.log(`⚠️  No changes made. User might already have ${targetRole} role.`);
    }
    
    // Verify the update
    const updatedUser = await User.findOne({ email: userEmail });
    console.log(`✅ Confirmed role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    
    if (error.message.includes('URI cannot contain options with no value')) {
      console.log('💡 There appears to be a malformed MongoDB URI. Check your .env file.');
      console.log('💡 Make sure there are no empty query parameters like ?&w=majority');
    }
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
  }
}

// Execute the script
makeAdmin().catch(console.error);
