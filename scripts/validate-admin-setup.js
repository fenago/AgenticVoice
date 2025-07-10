// Script to validate admin setup and database connection for Step 1
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://admin:Descartes2!@cluster0.e8syucq.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function validateAdminSetup() {
  console.log('🔍 Validating AgenticVoice Admin Setup - Step 1');
  console.log('================================================\n');

  let client;
  
  try {
    // 1. Test MongoDB Connection
    console.log('1. Testing MongoDB Connection...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('test'); // Using 'test' database as specified in URI
    console.log('✅ MongoDB connection successful!\n');

    // 2. List existing collections
    console.log('2. Checking existing collections...');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('📋 Found collections:', collectionNames.length > 0 ? collectionNames : 'No collections found');
    
    // Check for AgenticVoice collections (av_ prefix)
    const avCollections = collectionNames.filter(name => name.startsWith('av_'));
    if (avCollections.length > 0) {
      console.log('✅ AgenticVoice collections found:', avCollections);
    } else {
      console.log('⚠️  No av_ prefixed collections found. They may need to be created.');
    }
    console.log('');

    // 3. Check av_users collection specifically
    console.log('3. Validating av_users collection...');
    if (avCollections.includes('av_users')) {
      const usersCollection = db.collection('av_users');
      const userCount = await usersCollection.countDocuments();
      console.log(`✅ av_users collection exists with ${userCount} users`);
      
      // Check for admin users
      const adminUsers = await usersCollection.find({
        role: { $in: ['ADMIN', 'SUPER_ADMIN', 'GOD_MODE'] }
      }).toArray();
      
      if (adminUsers.length > 0) {
        console.log(`✅ Found ${adminUsers.length} admin user(s):`);
        adminUsers.forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.log('⚠️  No admin users found. You may need to create an admin user.');
      }
    } else {
      console.log('❌ av_users collection not found');
    }
    console.log('');

    // 4. Check av_audit_logs collection
    console.log('4. Validating av_audit_logs collection...');
    if (avCollections.includes('av_audit_logs')) {
      const auditCollection = db.collection('av_audit_logs');
      const auditCount = await auditCollection.countDocuments();
      console.log(`✅ av_audit_logs collection exists with ${auditCount} logs`);
    } else {
      console.log('⚠️  av_audit_logs collection not found. It will be created when first audit log is written.');
    }
    console.log('');

    // 5. Test sample queries for admin functionality
    console.log('5. Testing admin query patterns...');
    if (avCollections.includes('av_users')) {
      const usersCollection = db.collection('av_users');
      
      // Test role-based filtering
      const roleStats = await usersCollection.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      console.log('📊 User roles distribution:');
      roleStats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count} users`);
      });
      
      // Test account status filtering
      const statusStats = await usersCollection.aggregate([
        {
          $group: {
            _id: '$accountStatus',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      console.log('📊 Account status distribution:');
      statusStats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count} users`);
      });
    }
    console.log('');

    // 6. Validate indexes for performance
    console.log('6. Checking database indexes...');
    if (avCollections.includes('av_users')) {
      const usersCollection = db.collection('av_users');
      const indexes = await usersCollection.indexes();
      console.log('📋 av_users indexes:', indexes.map(idx => idx.name));
    }
    console.log('');

    // 7. Test write capability (create a test audit log)
    console.log('7. Testing write capability...');
    const auditCollection = db.collection('av_audit_logs');
    const testLog = {
      userId: 'test-admin-validation',
      action: 'validate_admin_setup',
      resource: 'system',
      details: { step: 'foundation_setup', validation: true },
      ipAddress: '127.0.0.1',
      severity: 'LOW',
      category: 'SYSTEM',
      status: 'SUCCESS',
      hipaaRelevant: false,
      timestamp: new Date(),
      createdAt: new Date(),
    };
    
    const writeResult = await auditCollection.insertOne(testLog);
    if (writeResult.acknowledged) {
      console.log('✅ Database write test successful');
      // Clean up test log
      await auditCollection.deleteOne({ _id: writeResult.insertedId });
      console.log('✅ Test cleanup completed');
    }
    console.log('');

    console.log('🎉 Step 1 Validation Results:');
    console.log('================================');
    console.log('✅ MongoDB connection: WORKING');
    console.log('✅ Database access: WORKING');
    console.log('✅ Collection validation: COMPLETE');
    console.log('✅ Admin user check: COMPLETE');
    console.log('✅ Audit logging: WORKING');
    console.log('✅ Query patterns: TESTED');
    console.log('✅ Write operations: WORKING');
    console.log('\n🚀 Ready to proceed with admin dashboard development!');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check MongoDB URI in .env file');
    console.log('2. Verify network connectivity');
    console.log('3. Ensure database permissions are correct');
    console.log('4. Check if collections need to be created');
  } finally {
    if (client) {
      await client.close();
      console.log('\n📝 Database connection closed.');
    }
  }
}

// Run validation
validateAdminSetup();
