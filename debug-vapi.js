// Quick debug script to check VAPI integration
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkVapiIntegration() {
    console.log('🔍 Checking VAPI Integration...\n');
    
    try {
        // Connect to MongoDB using environment variable
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        const users = await db.collection('users').find({}).toArray();
        
        console.log(`\n📊 Found ${users.length} users in database:`);
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.email}`);
            console.log(`   MongoDB ID: ${user._id}`);
            console.log(`   Stripe ID: ${user.customerId || 'Not Connected'}`);
            console.log(`   HubSpot ID: ${user.hubspotContactId || 'Not Connected'}`);
            console.log(`   VAPI Assistant ID: ${user.vapiAssistantId || 'Not Connected'}`);
            console.log(`   Last Updated: ${user.updatedAt}`);
        });
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
    }
}

// Run the check
checkVapiIntegration();
