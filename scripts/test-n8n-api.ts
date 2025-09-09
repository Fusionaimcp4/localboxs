#!/usr/bin/env ts-node

// Simple n8n API test script to diagnose authentication issues
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const N8N_BASE = process.env.N8N_BASE_URL;
const N8N_KEY = process.env.N8N_API_KEY;
const MAIN_WORKFLOW_ID = process.env.MAIN_WORKFLOW_ID;

async function testN8nAPI() {
  console.log('🧪 Testing n8n API Connection...\n');
  
  // Check environment variables
  console.log('Environment Check:');
  console.log('- N8N_BASE_URL:', N8N_BASE || '❌ NOT SET');
  console.log('- N8N_API_KEY:', N8N_KEY ? `✅ SET (${N8N_KEY.substring(0, 10)}...)` : '❌ NOT SET');
  console.log('- MAIN_WORKFLOW_ID:', MAIN_WORKFLOW_ID || '❌ NOT SET');
  
  if (!N8N_BASE || !N8N_KEY) {
    console.error('\n❌ Missing required environment variables. Please check your .env file.');
    return;
  }
  
  console.log('\n🔍 Testing API endpoints...\n');
  
  try {
    // Test 1: Get all workflows (should work with any valid API key)
    console.log('1. Testing GET /rest/workflows...');
    const workflowsResponse = await fetch(`${N8N_BASE}/rest/workflows`, {
      headers: { "X-N8N-API-KEY": N8N_KEY },
    });
    
    console.log(`   Status: ${workflowsResponse.status} ${workflowsResponse.statusText}`);
    
    if (workflowsResponse.ok) {
      const workflows = await workflowsResponse.json();
      console.log(`   ✅ Success! Found ${workflows.data?.length || 0} workflows`);
      
      if (workflows.data && workflows.data.length > 0) {
        console.log('   Available workflows:');
        workflows.data.slice(0, 5).forEach((wf: any) => {
          console.log(`   - ${wf.id}: ${wf.name}`);
        });
      }
    } else {
      const errorText = await workflowsResponse.text().catch(() => '');
      console.log(`   ❌ Failed: ${errorText}`);
      
      if (workflowsResponse.status === 401) {
        console.log('\n🔧 Authentication Issue Detected!');
        console.log('Possible solutions:');
        console.log('1. Check if your n8n API key is correct');
        console.log('2. Verify the API key has proper permissions');
        console.log('3. Make sure n8n API is enabled in settings');
        console.log('4. Try regenerating the API key in n8n Settings → API');
      }
    }
    
    // Test 2: Try to get specific workflow (if ID is provided)
    if (MAIN_WORKFLOW_ID && workflowsResponse.ok) {
      console.log(`\n2. Testing GET /rest/workflows/${MAIN_WORKFLOW_ID}...`);
      const specificWorkflowResponse = await fetch(`${N8N_BASE}/rest/workflows/${MAIN_WORKFLOW_ID}`, {
        headers: { "X-N8N-API-KEY": N8N_KEY },
      });
      
      console.log(`   Status: ${specificWorkflowResponse.status} ${specificWorkflowResponse.statusText}`);
      
      if (specificWorkflowResponse.ok) {
        const workflow = await specificWorkflowResponse.json();
        console.log(`   ✅ Success! Found workflow: ${workflow.name}`);
        console.log(`   - Nodes: ${workflow.nodes?.length || 0}`);
        console.log(`   - Active: ${workflow.active}`);
      } else {
        const errorText = await specificWorkflowResponse.text().catch(() => '');
        console.log(`   ❌ Failed: ${errorText}`);
        
        if (specificWorkflowResponse.status === 404) {
          console.log('\n🔧 Workflow Not Found!');
          console.log('The MAIN_WORKFLOW_ID might be incorrect or the workflow was deleted.');
        }
      }
    }
    
  } catch (error) {
    console.error('\n❌ Network Error:', error);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if n8n server is running and accessible');
    console.log('2. Verify the N8N_BASE_URL is correct');
    console.log('3. Check network connectivity');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Fix any issues identified above');
  console.log('2. Update your .env file with correct values');
  console.log('3. Restart your Next.js development server');
  console.log('4. Try the onboarding API again');
}

if (require.main === module) {
  testN8nAPI().catch(console.error);
}
