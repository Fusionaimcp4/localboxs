#!/usr/bin/env tsx

/**
 * Test script for workflow control API
 */

async function testWorkflowControl() {
  try {
    console.log('🧪 Testing workflow control API...');

    // Test data for sigle.io workflow
    const workflowId = 'cmgiq1wo9000kif8oqxb507t9'; // Database workflow ID
    const n8nWorkflowId = 'ZF7x37aQ0mhUKntD'; // The n8n workflow ID

    console.log(`📋 Testing workflow: ${workflowId}`);
    console.log(`📋 n8n ID: ${n8nWorkflowId}`);

    // Test 1: Start workflow
    console.log('\n🔄 Test 1: Starting workflow...');
    const startResponse = await fetch(`http://localhost:3000/api/dashboard/workflows/${workflowId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const startData = await startResponse.json();
    console.log(`📊 Start status: ${startResponse.status}`);
    console.log(`📋 Start response:`, startData);

    if (startResponse.ok) {
      console.log('✅ Workflow start successful!');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test 2: Stop workflow
      console.log('\n🔄 Test 2: Stopping workflow...');
      const stopResponse = await fetch(`http://localhost:3000/api/dashboard/workflows/${workflowId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const stopData = await stopResponse.json();
      console.log(`📊 Stop status: ${stopResponse.status}`);
      console.log(`📋 Stop response:`, stopData);

      if (stopResponse.ok) {
        console.log('✅ Workflow stop successful!');
      } else {
        console.log('❌ Workflow stop failed:', stopData.error);
      }
    } else {
      console.log('❌ Workflow start failed:', startData.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testWorkflowControl().catch(console.error);
