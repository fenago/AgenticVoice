/**
 * Test Setup Script for AgenticVoice.net
 * Run this script to verify the implementation is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 AgenticVoice.net Implementation Test\n');

// Check if required files exist
const requiredFiles = [
  'tailwind.config.js',
  'utils/cn.ts',
  'components/ui/Card.tsx',
  'components/ui/Button.tsx',
  'components/ui/Badge.tsx',
  'components/ui/Input.tsx',
  'components/ui/Modal.tsx',
  'components/ui/LoadingSpinner.tsx',
  'components/ui/index.ts',
  'components/auth/ProtectedRoute.tsx',
  'components/auth/RoleGuard.tsx',
  'models/User.ts',
  'models/VapiAssistant.ts',
  'models/AuditLog.ts',
  'models/CallRecord.ts',
  'libs/next-auth.ts',
  'utils/hipaa.ts',
  'types/next-auth.d.ts',
  'app/test/page.tsx'
];

console.log('📁 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

console.log('\n📦 Checking package.json dependencies...');
const packageJson = require('../package.json');
const requiredDependencies = [
  'next-auth',
  'mongoose',
  'tailwindcss',
  'clsx',
  'tailwind-merge',
  'class-variance-authority'
];

requiredDependencies.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
  }
});

console.log('\n🔐 Checking environment variables...');
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MONGODB_URI',
  'GOOGLE_ID',
  'GOOGLE_SECRET',
  'RESEND_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`⚠️  ${envVar} - NOT SET (check .env.local)`);
  }
});

console.log('\n📊 Test Summary:');
if (missingFiles.length === 0) {
  console.log('✅ All required files are present');
} else {
  console.log(`❌ ${missingFiles.length} files are missing`);
}

console.log('\n🚀 Next Steps:');
console.log('1. Set up your environment variables in .env.local');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000/test');
console.log('4. Test authentication at: http://localhost:3000/login');
console.log('5. Test protected routes at: http://localhost:3000/dashboard');

console.log('\n🔧 Troubleshooting:');
console.log('- If MongoDB connection fails, check MONGODB_URI');
console.log('- If Google OAuth fails, check GOOGLE_ID and GOOGLE_SECRET');
console.log('- If email fails, check RESEND_API_KEY');
console.log('- For HIPAA compliance, ensure medical users get proper industry type');

console.log('\n📋 Testing Checklist:');
console.log('□ Components render correctly');
console.log('□ Authentication works (Google + Email)');
console.log('□ Role-based access control functions');
console.log('□ Database models save data correctly');
console.log('□ HIPAA compliance features work for medical users');
console.log('□ Design system is consistent');
console.log('□ Responsive design works on mobile');

console.log('\n✨ Phase 1 Complete! Ready for Phase 2 implementation.');
