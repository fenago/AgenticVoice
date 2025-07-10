// Quick test to check Kimberly Lee's sync status
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function testUserSync() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('test');
    const usersCollection = db.collection('av_users');

    // Find Kimberly Lee
    const user = await usersCollection.findOne({ 
      $or: [
        { email: { $regex: /kimberly.*lee/i } },
        { name: { $regex: /kimberly.*lee/i } }
      ]
    });

    if (user) {
      console.log('Found user:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        vapiUserId: user.vapiUserId,
        hubspotContactId: user.hubspotContactId,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } else {
      console.log('Kimberly Lee not found');
      
      // Let's find any user
      const anyUser = await usersCollection.findOne({});
      console.log('Sample user:', anyUser);
    }

    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testUserSync();
