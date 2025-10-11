#!/usr/bin/env tsx

/**
 * Script to test the core fixes for demo creation
 */

async function testCoreFixes() {
  try {
    console.log('🧪 Testing core fixes for demo creation...');

    // Test 1: Anonymous demo creation
    console.log('\n📋 Test 1: Anonymous demo creation');
    const demoPayload = {
      url: 'https://testcompany.com',
      businessName: 'Test Company',
      primaryColor: '#7ee787',
      secondaryColor: '#f4a261'
    };

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
      console.log('✅ Anonymous demo creation works!');
      console.log('📋 Demo URL:', demoData.demo_url);
      
      // Test 2: n8n callback with business name mismatch
      console.log('\n📋 Test 2: n8n callback with business name mismatch');
      const callbackPayload = {
        businessName: 'Test Company demo', // n8n adds "demo" suffix
        workflowId: 'test-workflow-123'
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
      } else {
        console.log('❌ Callback failed:', callbackData.error);
      }
    } else {
      console.log('❌ Demo creation failed:', demoData.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testCoreFixes().catch(console.error);
