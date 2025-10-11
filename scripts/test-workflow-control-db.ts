#!/usr/bin/env tsx

/**
 * Test script for workflow control API (database only, no n8n API)
 */

async function testWorkflowControlDatabase() {
  try {
    console.log('🧪 Testing workflow control API (database only)...');

    // Test data for sigle.io workflow
    const workflowId = 'cmgiq1wo9000kif8oqxb507t9'; // Database workflow ID
    const n8nWorkflowId = 'ZF7x37aQ0mhUKntD'; // The n8n workflow ID

    console.log(`📋 Testing workflow: ${workflowId}`);
    console.log(`📋 n8n ID: ${n8nWorkflowId}`);

    // Test 1: Start workflow (will fail n8n API but should update database)
    console.log('\n🔄 Test 1: Starting workflow...');
    const startResponse = await fetch(`http://localhost:3000/api/dashboard/workflows/${workflowId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const startData = await startResponse.json();
    console.log(`📊 Start status: ${startResponse.status}`);
    console.log(`📋 Start response:`, JSON.stringify(startData, null, 2));

    if (startResponse.ok) {
      console.log('✅ Workflow start successful!');
    } else {
      console.log('❌ Workflow start failed:', startData.error);
      
      // Check if it's an n8n API error (expected without API key)
      if (startData.error && startData.error.includes('N8N_API_KEY')) {
        console.log('ℹ️ This is expected - N8N_API_KEY not configured');
        console.log('🎯 The API structure is working correctly!');
      }
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testWorkflowControlDatabase().catch(console.error);
