/**
 * Verify AgenticVoice Collections Script
 * This script checks if all models are using the correct av_ prefix
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AgenticVoice Collection Names\n');

const modelsDir = path.join(process.cwd(), 'models');
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.ts') && !file.includes('plugins'));

const expectedCollections = {
  'User.ts': 'av_users',
  'VapiAssistant.ts': 'av_vapi_assistants', 
  'CallRecord.ts': 'av_call_records',
  'AuditLog.ts': 'av_audit_logs',
  'DemoRequest.ts': 'av_demo_requests',
  'Lead.ts': 'av_leads'
};

console.log('📁 Checking model files for correct collection names...\n');

let allCorrect = true;

for (const file of modelFiles) {
  const filePath = path.join(modelsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for mongoose.model calls
  const modelMatch = content.match(/mongoose\.model\s*\(\s*["']([^"']+)["']\s*,\s*\w+\s*(?:,\s*["']([^"']+)["'])?\s*\)/);
  
  if (modelMatch) {
    const modelName = modelMatch[1];
    const collectionName = modelMatch[2] || modelName.toLowerCase() + 's';
    const expectedCollection = expectedCollections[file];
    
    if (expectedCollection) {
      if (collectionName === expectedCollection) {
        console.log(`✅ ${file}: ${modelName} → ${collectionName}`);
      } else {
        console.log(`❌ ${file}: ${modelName} → ${collectionName} (expected: ${expectedCollection})`);
        allCorrect = false;
      }
    } else {
      console.log(`⚠️  ${file}: ${modelName} → ${collectionName} (not in expected list)`);
    }
  } else {
    console.log(`❓ ${file}: Could not find mongoose.model call`);
  }
}

console.log('\n📋 Expected AgenticVoice Collections:');
Object.entries(expectedCollections).forEach(([file, collection]) => {
  console.log(`   ${collection} (from ${file})`);
});

console.log('\n🔐 NextAuth Collections (configured in libs/next-auth.ts):');
console.log('   av_accounts');
console.log('   av_sessions'); 
console.log('   av_users');
console.log('   av_verification_tokens');

if (allCorrect) {
  console.log('\n✅ All collections are correctly prefixed with "av_"!');
} else {
  console.log('\n❌ Some collections need to be updated with the "av_" prefix.');
}

console.log('\n📊 Summary:');
console.log(`Total models checked: ${modelFiles.length}`);
console.log(`Expected collections: ${Object.keys(expectedCollections).length}`);
console.log('NextAuth collections: 4');
console.log('Total AgenticVoice collections: ' + (Object.keys(expectedCollections).length + 4));

console.log('\n🛡️  Collection Prefix Benefits:');
console.log('• Namespace isolation from other apps');
console.log('• Easy identification of AgenticVoice data');
console.log('• Safe database operations and migrations');
console.log('• Organized database structure');
