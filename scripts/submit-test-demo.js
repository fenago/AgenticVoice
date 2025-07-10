async function submitDemoRequest() {
  const testData = {
    name: 'Dr. Test User',
    email: 'test@agenticvoice.com',
    phone: '(555) 123-4567',
    practiceType: 'medical-primary',
    preferredTime: 'morning',
    message: 'This is a test submission to create the collection',
    agreeToTerms: true
  };
  
  try {
    console.log('Submitting demo request to create collection...');
    
    const response = await fetch('http://localhost:3000/api/demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Demo request submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('\nThe av_demo_requests collection should now exist in your database.');
      console.log('Check MongoDB Atlas again - you should see it now!');
    } else {
      console.log('❌ Error:', result.error || result.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Wait a moment for server to start, then submit
setTimeout(submitDemoRequest, 2000);
