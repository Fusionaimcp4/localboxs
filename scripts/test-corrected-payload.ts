#!/usr/bin/env tsx

/**
 * Script to test the corrected n8n payload format
 */

async function testCorrectedPayload() {
  try {
    console.log('🧪 Testing corrected n8n payload format...');

    // Simulate the corrected payload from your n8n workflow
    const payload = {
      businessName: 'stacks.co demo', // From webhook trigger
      workflowId: 'T5Q6S1lmkjjmJSN2', // From created workflow
      chatwootInboxId: 123, // From webhook trigger (if available)
      chatwootWebsiteToken: 'test-token-123' // From webhook trigger (if available)
    };

    console.log('📋 Sending corrected payload:', payload);

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
      console.log('✅ Corrected payload test successful!');
      console.log('🎯 Your n8n workflow should now work correctly');
    } else {
      console.log('❌ Test failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testCorrectedPayload().catch(console.error);
