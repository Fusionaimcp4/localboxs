#!/usr/bin/env tsx

/**
 * Script to test the workflow ID update endpoint
 */

async function testWorkflowIdUpdate() {
  try {
    console.log('🧪 Testing workflow ID update endpoint...');

    const payload = {
      businessName: 'Fin AI',
      workflowId: 'CUJrjaBvJYDFVJNP',
      chatwootInboxId: 123,
      chatwootWebsiteToken: 'test-token-123',
      chatwootAgentBotId: 'bot-456',
      chatwootAgentBotAccessToken: 'access-token-789'
    };

    console.log('📋 Sending payload:', payload);

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
      console.log('✅ Test successful!');
    } else {
      console.log('❌ Test failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testWorkflowIdUpdate().catch(console.error);
