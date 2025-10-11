#!/usr/bin/env tsx

/**
 * Script to test the simplified n8n payload (only what n8n actually has)
 */

async function testSimplifiedPayload() {
  try {
    console.log('🧪 Testing simplified n8n payload (only what n8n has)...');

    // Simulate what n8n actually sends (only businessName and workflowId)
    const payload = {
      businessName: 'stacks.co demo', // From webhook trigger
      workflowId: 'T5Q6S1lmkjjmJSN2'  // From n8n workflow creation
    };

    console.log('📋 Sending simplified payload:', payload);
    console.log('ℹ️ Note: n8n doesn\'t have Chatwoot IDs - that\'s normal!');

    const response = await fetch('http://localhost:3000/api/workflow/update-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    console.log(`📊 Response status: ${response.status}`);
    console.log('📋 Response data:', data);

    if (response.ok) {
      console.log('✅ Simplified payload test successful!');
      console.log('🎯 This is what your n8n workflow should send');
    } else {
      console.log('❌ Test failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testSimplifiedPayload().catch(console.error);
