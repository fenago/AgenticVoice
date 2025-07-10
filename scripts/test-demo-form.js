const fetch = require('node-fetch');

// Sample demo request data
const testData = {
  name: 'Dr. Jane Smith',
  email: 'jane.smith@medicalpractice.com',
  phone: '(555) 123-4567',
  practiceType: 'medical-primary',
  preferredTime: 'morning',
  message: 'I would like to see a demo of how AgenticVoice can help reduce our missed calls and improve patient communication.',
  agreeToTerms: true
};

async function testDemoSubmission() {
  try {
    // Submit demo request
    console.log('Submitting test demo request...');
    console.log('Test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Demo request successfully submitted!');
      console.log('Demo request ID:', result.data?._id);
    } else {
      console.log('\n❌ Demo request submission failed:', result.error || result.message);
    }
  } catch (error) {
    console.error('Error testing demo submission:', error);
  }
}

// Execute the test
testDemoSubmission();
