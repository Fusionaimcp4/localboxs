/**
 * Test script for the new n8n webhook integration
 */

import { duplicateWorkflowViaWebhook } from '../lib/n8n-webhook';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWebhookIntegration() {
  console.log('🧪 Testing n8n webhook integration...');
  
  // Test data
  const businessName = 'TestBusiness';
  const apiKey = 'test-api-key-12345';
  const systemMessage = `# Test System Message

You are an AI assistant for TestBusiness.

## Knowledge Base

TestBusiness is a software company that provides innovative solutions for businesses.

## Core Services
- Custom software development
- AI integration services  
- Technical consulting

Please assist customers with questions about our services.`;

  console.log('📋 Test Configuration:');
  console.log('- Business Name:', businessName);
  console.log('- API Key:', apiKey.substring(0, 10) + '...');
  console.log('- System Message Length:', systemMessage.length, 'characters');
  console.log('- Endpoint:', process.env.N8N_DUPLICATE_ENDPOINT || 'NOT SET');
  console.log('');

  try {
    const result = await duplicateWorkflowViaWebhook(
      businessName,
      apiKey,
      systemMessage
    );

    console.log('📊 Test Results:');
    console.log('- Success:', result.success);
    if (result.error) {
      console.log('- Error:', result.error);
    }
    
    if (result.success) {
      console.log('✅ Webhook integration test PASSED');
    } else {
      console.log('❌ Webhook integration test FAILED');
    }
  } catch (error) {
    console.error('💥 Test failed with exception:', error);
  }
}

// Run the test
testWebhookIntegration().catch(console.error);
