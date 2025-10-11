#!/usr/bin/env tsx

/**
 * Test n8n workflow status update
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testN8nWorkflowUpdate() {
  try {
    console.log('🧪 Testing n8n workflow status update...');

    const workflowId = 'ZF7x37aQ0mhUKntD';
    const baseUrl = process.env.N8N_BASE_URL || 'https://n8n.sost.work';
    const apiKey = process.env.N8N_API_KEY;

    if (!apiKey) {
      console.error('❌ N8N_API_KEY not found in environment');
      return;
    }

    console.log(`📋 Testing workflow: ${workflowId}`);

    // Test 1: Get current workflow status
    console.log('\n🔄 Test 1: Getting current workflow status...');
    const getResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('❌ Failed to get workflow:', errorText);
      return;
    }

    const workflow = await getResponse.json();
    console.log(`📋 Current status: ${workflow.active ? 'ACTIVE' : 'INACTIVE'}`);

    // Test 2: Update workflow status (toggle it)
    console.log('\n🔄 Test 2: Updating workflow status...');
    const newStatus = !workflow.active;
    console.log(`📋 Setting status to: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);

    const updateResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: workflow.name,
        active: newStatus,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {},
        staticData: workflow.staticData || {}
      })
    });

    console.log(`📊 Update status: ${updateResponse.status}`);

    if (updateResponse.ok) {
      const updatedWorkflow = await updateResponse.json();
      console.log('✅ Workflow status updated successfully!');
      console.log(`📋 New status: ${updatedWorkflow.active ? 'ACTIVE' : 'INACTIVE'}`);
      
      // Test 3: Toggle back to original
      console.log('\n🔄 Test 3: Restoring original status...');
      const restoreResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflow.name,
          active: workflow.active, // Back to original
          nodes: workflow.nodes,
          connections: workflow.connections,
          settings: workflow.settings || {},
          staticData: workflow.staticData || {}
        })
      });

      if (restoreResponse.ok) {
        console.log('✅ Workflow status restored successfully!');
        console.log('🎉 n8n workflow status update is working correctly!');
      } else {
        const errorText = await restoreResponse.text();
        console.log('❌ Failed to restore workflow status:', errorText);
      }
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Failed to update workflow status:', errorText);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testN8nWorkflowUpdate().catch(console.error);
