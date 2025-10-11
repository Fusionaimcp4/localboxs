#!/usr/bin/env tsx

/**
 * Script to test the complete workflow ID update flow
 */

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete workflow ID update flow...');

    // Simulate what n8n would send
    const payload = {
      businessName: 'Fin AI',
      workflowId: 'CUJrjaBvJYDFVJNP',
      chatwootInboxId: 123,
      chatwootWebsiteToken: 'test-token-123'
    };

    console.log('📋 Simulating n8n callback with payload:', payload);

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
      console.log('✅ Complete flow test successful!');
      console.log('🎯 Next steps:');
      console.log('1. Start ngrok: npx tsx scripts/start-ngrok.ts');
      console.log('2. Update your n8n workflow duplicator with the ngrok URL');
      console.log('3. Test by creating a new demo');
    } else {
      console.log('❌ Test failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testCompleteFlow().catch(console.error);
