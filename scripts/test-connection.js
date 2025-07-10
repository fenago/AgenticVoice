/**
 * Test MongoDB connection and list users
 */

const mongoose = require('mongoose');

// Direct URI (testing)
const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/agenticvoice?retryWrites=true&w=majority&appName=Cluster0';

// User schema
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
  collection: 'av_users'
});

async function testConnection() {
  try {
    console.log('🔌 Testing direct MongoDB connection...');
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });
    
    console.log('✅ Connected successfully!');
    
    const User = mongoose.model('User', userSchema);
    
    // List all users
    const users = await User.find({}).limit(10);
    console.log(`📊 Found ${users.length} users in av_users collection:`);
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role || 'FREE'}) - ${user.name || 'No name'}`);
    });
    
    // Try to promote the user
    const userEmail = 'socrates73@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log(`\n🎯 Found target user: ${user.email}`);
      console.log(`📋 Current role: ${user.role}`);
      
      const result = await User.updateOne(
        { email: userEmail },
        { role: 'GOD_MODE', updatedAt: new Date() }
      );
      
      if (result.modifiedCount > 0) {
        console.log('🎉 Successfully promoted to GOD_MODE!');
      } else {
        console.log('⚠️ No changes made (already GOD_MODE?)');
      }
      
      // Verify
      const updatedUser = await User.findOne({ email: userEmail });
      console.log(`✅ Confirmed role: ${updatedUser.role}`);
    } else {
      console.log(`❌ User ${userEmail} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

testConnection();
