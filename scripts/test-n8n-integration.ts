#!/usr/bin/env ts-node

import { patchWorkflowForBusiness } from '../lib/n8n';

// Mock workflow to test patching
const mockWorkflow = {
  id: "test-workflow",
  name: "Main Workflow",
  nodes: [
    {
      name: "Main AI Agent",
      type: "openai",
      parameters: {
        systemMessage: "Original system message",
        options: {
          additionalFields: {}
        }
      }
    },
    {
      name: "Webhook Trigger",
      type: "webhook",
      parameters: {
        path: "original-path",
        options: {}
      }
    },
    {
      name: "Chatwoot HTTP POST",
      type: "http-request",
      parameters: {
        url: "https://chatwoot.mcp4.ai/api/v1/accounts/1/messages",
        options: {
          headers: [
            { name: "Content-Type", value: "application/json" }
          ]
        }
      }
    }
  ]
};

console.log('🧪 Testing n8n workflow patching...\n');

// Test patching
const businessName = "TestCompany";
const systemMessage = "You are a TestCompany support agent.";
const botAccessToken = "test-bot-token-123";

console.log('Before patching:');
console.log('- Main AI systemMessage:', mockWorkflow.nodes[0].parameters.systemMessage);
console.log('- Webhook path:', mockWorkflow.nodes[1].parameters.path);
console.log('- HTTP headers count:', mockWorkflow.nodes[2].parameters.options.headers.length);

patchWorkflowForBusiness(mockWorkflow, businessName, systemMessage, botAccessToken);

console.log('\nAfter patching:');
console.log('- Main AI systemMessage:', mockWorkflow.nodes[0].parameters.systemMessage);
console.log('- Webhook path:', mockWorkflow.nodes[1].parameters.path);
console.log('- Webhook URL:', (mockWorkflow.nodes[1].parameters.options as any).webhookUrl);
console.log('- HTTP headers count:', mockWorkflow.nodes[2].parameters.options.headers.length);
console.log('- HTTP headers:', JSON.stringify(mockWorkflow.nodes[2].parameters.options.headers, null, 2));

// Verify results
const tests = [
  {
    name: 'System message updated',
    pass: mockWorkflow.nodes[0].parameters.systemMessage === systemMessage
  },
  {
    name: 'Webhook path updated',
    pass: mockWorkflow.nodes[1].parameters.path === businessName
  },
  {
    name: 'Webhook URL set',
    pass: (mockWorkflow.nodes[1].parameters.options as any).webhookUrl?.includes(businessName)
  },
  {
    name: 'Bot token added to headers',
    pass: mockWorkflow.nodes[2].parameters.options.headers.some((h: any) => 
      h.name === 'api_access_token' && h.value === botAccessToken
    )
  },
  {
    name: 'Authorization header added',
    pass: mockWorkflow.nodes[2].parameters.options.headers.some((h: any) => 
      h.name === 'Authorization' && h.value === `Bearer ${botAccessToken}`
    )
  }
];

console.log('\n📊 Test Results:');
tests.forEach(test => {
  console.log(`${test.pass ? '✅' : '❌'} ${test.name}`);
});

const allPassed = tests.every(test => test.pass);
console.log(`\n${allPassed ? '🎉 All tests passed!' : '❌ Some tests failed!'}`);

if (!allPassed) {
  process.exit(1);
}
