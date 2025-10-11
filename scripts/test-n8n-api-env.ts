#!/usr/bin/env tsx

/**
 * Test n8n API with dotenv
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testN8nApiWithEnv() {
  try {
    console.log('🧪 Testing n8n API with environment variables...');

    const workflowId = 'ZF7x37aQ0mhUKntD';
    const baseUrl = process.env.N8N_BASE_URL || 'https://n8n.sost.work';
    const apiKey = process.env.N8N_API_KEY;

    console.log(`📋 Base URL: ${baseUrl}`);
    console.log(`📋 API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET'}`);

    if (!apiKey) {
      console.error('❌ N8N_API_KEY not found in environment');
      return;
    }

    // Test 1: Get workflow details
    console.log('\n🔄 Test 1: Getting workflow details...');
    const response = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const workflow = await response.json();
      console.log('✅ Workflow details retrieved successfully!');
      console.log(`📋 Workflow name: ${workflow.name}`);
      console.log(`📋 Workflow active: ${workflow.active}`);
      console.log('🎉 n8n API is working correctly!');
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to get workflow details:', errorText);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the test
testN8nApiWithEnv().catch(console.error);
