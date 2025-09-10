/**
 * Test script for the corrected Chatwoot bot assignment
 */

import { createAgentBot, assignBotToInbox, verifyBotAssignment } from '../lib/chatwoot_admin';
import { createWebsiteInbox } from '../lib/chatwoot';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testBotAssignment() {
  console.log('🧪 Testing Chatwoot bot assignment with correct API...');
  
  const testBusinessName = 'TestBot';
  const testInboxName = `${testBusinessName} Test Inbox`;
  const testDemoUrl = 'https://test-demo.localboxs.com';

  console.log('📋 Test Configuration:');
  console.log('- Business Name:', testBusinessName);
  console.log('- Inbox Name:', testInboxName);
  console.log('- Demo URL:', testDemoUrl);
  console.log('- Chatwoot Base:', process.env.CHATWOOT_BASE_URL || 'NOT SET');
  console.log('- Account ID:', process.env.CHATWOOT_ACCOUNT_ID || 'NOT SET');
  console.log('- API Key:', process.env.CHATWOOT_API_KEY ? 'SET' : 'NOT SET');
  console.log('');

  try {
    // Step 1: Create inbox
    console.log('📥 Step 1: Creating website inbox...');
    const { inbox_id, website_token } = await createWebsiteInbox(testInboxName, testDemoUrl);
    console.log('✅ Inbox created:', { inbox_id, website_token: website_token.substring(0, 10) + '...' });

    // Step 2: Create bot
    console.log('🤖 Step 2: Creating agent bot...');
    const { id: botId, access_token } = await createAgentBot(testBusinessName);
    console.log('✅ Bot created:', { botId, access_token: access_token.substring(0, 10) + '...' });

    // Step 3: Assign bot to inbox (using correct endpoint)
    console.log('🔗 Step 3: Assigning bot to inbox using correct API...');
    await assignBotToInbox(inbox_id, botId);
    console.log('✅ Bot assignment completed');

    // Step 4: Verify assignment
    console.log('🔍 Step 4: Verifying bot assignment...');
    const verified = await verifyBotAssignment(inbox_id, botId);
    
    if (verified) {
      console.log('🎉 SUCCESS: Bot is properly assigned to inbox!');
    } else {
      console.log('❌ FAILED: Bot assignment could not be verified');
    }

    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('- Inbox ID:', inbox_id);
    console.log('- Bot ID:', botId);
    console.log('- Assignment Status:', verified ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the test
testBotAssignment().catch(console.error);
