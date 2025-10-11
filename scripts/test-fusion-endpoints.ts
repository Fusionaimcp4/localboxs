import dotenv from 'dotenv';
import { getFusionConfig } from '../lib/fusion-api';

// Load environment variables
dotenv.config();

async function testFusionEndpoints() {
  console.log('🧪 Testing Fusion API endpoints for model switching...\n');

  const { baseUrl, apiKey } = getFusionConfig();
  console.log(`🔍 Testing against: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...\n`);

  const possibleEndpoints = [
    '/api/switch-model',
    '/switch-model',
    '/api/workflows/switch-model',
    '/api/workflows/switch',
    '/fusion/switch-model',
    '/api/v1/switch-model',
    '/api/models/switch',
    '/api/workflow/switch-model'
  ];

  const testPayload = {
    workflow_id: 'test-workflow-id',
    model: 'openai/gpt-4o-mini'
  };

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 404) {
        console.log(`   ❌ Not found`);
      } else if (response.status === 405) {
        console.log(`   ⚠️  Method not allowed (endpoint exists but wrong method)`);
      } else if (response.status === 400) {
        console.log(`   ✅ Endpoint exists! (400 = bad request, but endpoint found)`);
        const responseText = await response.text();
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
      } else if (response.status === 401) {
        console.log(`   ✅ Endpoint exists! (401 = unauthorized, but endpoint found)`);
      } else {
        console.log(`   ✅ Endpoint exists! (Status: ${response.status})`);
        const responseText = await response.text();
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('');
  }

  console.log('🎯 Test completed! Look for endpoints that return 400, 401, or other non-404 status codes.');
}

testFusionEndpoints();
