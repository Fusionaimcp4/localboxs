#!/usr/bin/env tsx

/**
 * Test n8n workflow activation/deactivation endpoints
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testN8nWorkflowActivation() {
  try {
    console.log('🧪 Testing n8n workflow activation/deactivation...');

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

    // Test 2: Deactivate workflow
    console.log('\n🔄 Test 2: Deactivating workflow...');
    const deactivateResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Deactivate status: ${deactivateResponse.status}`);

    if (deactivateResponse.ok) {
      console.log('✅ Workflow deactivated successfully!');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test 3: Activate workflow
      console.log('\n🔄 Test 3: Activating workflow...');
      const activateResponse = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Activate status: ${activateResponse.status}`);

      if (activateResponse.ok) {
        console.log('✅ Workflow activated successfully!');
        console.log('🎉 n8n workflow activation/deactivation is working correctly!');
      } else {
        const errorText = await activateResponse.text();
        console.log('❌ Failed to activate workflow:', errorText);
      }
    } else {
      const errorText = await deactivateResponse.text();
      console.log('❌ Failed to deactivate workflow:', errorText);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testN8nWorkflowActivation().catch(console.error);
