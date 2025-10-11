#!/usr/bin/env tsx

/**
 * Script to test the core fixes with a real URL
 */

async function testCoreFixesReal() {
  try {
    console.log('🧪 Testing core fixes with real URL...');

    // Test with a real URL that exists
    const demoPayload = {
      url: 'https://google.com',
      businessName: 'Google',
      primaryColor: '#7ee787',
      secondaryColor: '#f4a261'
    };

    console.log('📋 Creating demo for Google...');
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
      
      // Test n8n callback with business name mismatch
      console.log('\n📋 Testing n8n callback with name mismatch...');
      const callbackPayload = {
        businessName: 'Google demo', // n8n adds "demo" suffix
        workflowId: 'test-workflow-456'
      };

      const callbackResponse = await fetch('http://localhost:3000/api/workflow/update-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackPayload)
      });

      const callbackData = await callbackResponse.json();
      console.log(`📊 Callback status: ${callbackResponse.status}`);
      
      if (callbackResponse.ok) {
        console.log('✅ n8n callback with name mismatch works!');
        console.log('📋 Workflow ID linked:', callbackData.workflowId);
        console.log('🎉 Core fixes are working correctly!');
      } else {
        console.log('❌ Callback failed:', callbackData.error);
      }
    } else {
      console.log('❌ Demo creation failed:', demoData.error);
      console.log('📋 This might be due to scraping issues, but the core logic should work');
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testCoreFixesReal().catch(console.error);
