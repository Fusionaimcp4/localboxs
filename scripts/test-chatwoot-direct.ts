#!/usr/bin/env tsx

/**
 * Direct Chatwoot API test to verify credentials and endpoints
 */

const CHATWOOT_BASE_URL = 'https://chatwoot.mcp4.ai';
const CHATWOOT_ACCOUNT_ID = '2';
const CHATWOOT_API_KEY = 'BVraYynQoVMRWRsuwsimnucg';

async function testChatwootAPI() {
  console.log('🧪 Testing Chatwoot API directly...\n');

  // Test 1: Check account access
  console.log('1. Testing account access...');
  try {
    const response = await fetch(`${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}`, {
      headers: {
        'api_access_token': CHATWOOT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Account API Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Account accessible: ${data.name || 'Unknown'}`);
    } else {
      const error = await response.text();
      console.log(`❌ Account access failed: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Account access error: ${error}`);
  }

  // Test 2: Check contacts search endpoint
  console.log('\n2. Testing contacts search endpoint...');
  try {
    const response = await fetch(`${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=test@example.com`, {
      headers: {
        'api_access_token': CHATWOOT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Search API Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Search endpoint works: Found ${data.length || 0} contacts`);
    } else {
      const error = await response.text();
      console.log(`❌ Search endpoint failed: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Search endpoint error: ${error}`);
  }

  // Test 3: Check contacts list endpoint
  console.log('\n3. Testing contacts list endpoint...');
  try {
    const response = await fetch(`${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`, {
      headers: {
        'api_access_token': CHATWOOT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`List API Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ List endpoint works: Found ${data.payload?.length || 0} contacts`);
    } else {
      const error = await response.text();
      console.log(`❌ List endpoint failed: ${error}`);
    }
  } catch (error) {
    console.log(`❌ List endpoint error: ${error}`);
  }

  // Test 4: Check inboxes endpoint
  console.log('\n4. Testing inboxes endpoint...');
  try {
    const response = await fetch(`${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`, {
      headers: {
        'api_access_token': CHATWOOT_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Inboxes API Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Inboxes endpoint works: Found ${data.payload?.length || 0} inboxes`);
      if (data.payload && data.payload.length > 0) {
        console.log('Available inboxes:');
        data.payload.forEach((inbox: any) => {
          console.log(`  - ${inbox.name} (ID: ${inbox.id})`);
        });
      }
    } else {
      const error = await response.text();
      console.log(`❌ Inboxes endpoint failed: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Inboxes endpoint error: ${error}`);
  }
}

if (require.main === module) {
  testChatwootAPI().catch(console.error);
}
