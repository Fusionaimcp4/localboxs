#!/usr/bin/env tsx

/**
 * Test the fixed demo creation
 */

async function testFixedDemoCreation() {
  try {
    console.log('🧪 Testing fixed demo creation...');

    const demoPayload = {
      url: 'https://testcompany.com',
      businessName: 'Test Company',
      primaryColor: '#7ee787',
      secondaryColor: '#f4a261'
    };

    console.log('📋 Creating demo...');
    const demoResponse = await fetch('http://localhost:3000/api/demo/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(demoPayload)
    });

    const demoData = await demoResponse.json();
    console.log(`📊 Demo creation status: ${demoResponse.status}`);
    
    if (demoResponse.ok) {
      console.log('✅ Demo creation works!');
      console.log('📋 Demo URL:', demoData.demo_url);
    } else {
      console.log('❌ Demo creation failed:', demoData.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testFixedDemoCreation().catch(console.error);
