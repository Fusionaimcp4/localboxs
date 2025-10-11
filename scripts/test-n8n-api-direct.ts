#!/usr/bin/env tsx

/**
 * Test n8n API directly
 */

async function testN8nApi() {
  try {
    console.log('🧪 Testing n8n API directly...');

    const workflowId = 'ZF7x37aQ0mhUKntD';
    const baseUrl = process.env.N8N_BASE_URL || 'https://n8n.sost.work';
    const apiKey = process.env.N8N_API_KEY;

    if (!apiKey) {
      console.error('❌ N8N_API_KEY not found in environment');
      return;
    }

    console.log(`📋 Testing workflow: ${workflowId}`);
    console.log(`📋 Base URL: ${baseUrl}`);

    // Test 1: Get workflow details
    console.log('\n🔄 Test 1: Getting workflow details...');
    const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const workflow = await response.json();
      console.log('✅ Workflow details retrieved successfully!');
      console.log(`📋 Workflow name: ${workflow.name}`);
      console.log(`📋 Workflow active: ${workflow.active}`);
      console.log(`📋 Workflow nodes: ${workflow.nodes?.length || 0}`);
      
      // Test 2: Update workflow status
      console.log('\n🔄 Test 2: Updating workflow status...');
      const updateResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workflow,
          active: !workflow.active // Toggle the status
        })
      });

      console.log(`📊 Update status: ${updateResponse.status}`);

      if (updateResponse.ok) {
        const updatedWorkflow = await updateResponse.json();
        console.log('✅ Workflow status updated successfully!');
        console.log(`📋 New active status: ${updatedWorkflow.active}`);
        
        // Test 3: Toggle back
        console.log('\n🔄 Test 3: Toggling back...');
        const toggleBackResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...updatedWorkflow,
            active: workflow.active // Back to original
          })
        });

        if (toggleBackResponse.ok) {
          console.log('✅ Workflow status restored successfully!');
          console.log('🎉 n8n API is working correctly!');
        } else {
          console.log('❌ Failed to restore workflow status');
        }
      } else {
        const errorText = await updateResponse.text();
        console.log('❌ Failed to update workflow status:', errorText);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get workflow details:', errorText);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testN8nApi().catch(console.error);
