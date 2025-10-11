#!/usr/bin/env tsx

/**
 * Script to test the blocksurvey.io demo callback
 */

async function testBlocksurveyCallback() {
  try {
    console.log('🧪 Testing blocksurvey.io demo callback...');

    // Test with the actual business name from the database
    const payload = {
      businessName: 'blocksurvey.io demo', // Exact match from database
      workflowId: 'doBFhHWq2NmyzWky'  // The actual workflow ID
    };

    console.log('📋 Sending callback payload:', payload);

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
      console.log('✅ blocksurvey.io callback test successful!');
      console.log('🎯 The n8n workflow ID has been properly linked');
    } else {
      console.log('❌ Test failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testBlocksurveyCallback().catch(console.error);
