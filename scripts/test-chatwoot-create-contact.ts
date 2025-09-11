#!/usr/bin/env tsx

/**
 * Test Chatwoot contact creation directly
 */

const CHATWOOT_BASE_URL = 'https://chatwoot.mcp4.ai';
const CHATWOOT_ACCOUNT_ID = '2';
const CHATWOOT_API_KEY = 'BVraYynQoVMRWRsuwsimnucg';

async function testContactCreation() {
  console.log('🧪 Testing Chatwoot contact creation...\n');

  const contactData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    phone_number: `+1234567${Date.now().toString().slice(-4)}`,
    identifier: `demo_test_${Date.now()}`,
    custom_attributes: {
      source: 'demo_page',
      consent: true,
      company: 'Test Company',
      demo_slug: 'test-company',
      business_url: 'https://example.com',
      demo_url: 'https://demo.example.com',
      system_message_file: '/system-message/test.md',
      created_at: new Date().toISOString(),
    }
  };

  console.log('Contact data:', JSON.stringify(contactData, null, 2));

  try {
    const response = await fetch(`${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`, {
      method: 'POST',
      headers: {
        'api_access_token': CHATWOOT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log(`\n✅ Contact created successfully!`);
      console.log(`Contact ID: ${data.id}`);
      console.log(`Contact Name: ${data.name}`);
      console.log(`Contact Email: ${data.email}`);
    } else {
      console.log(`\n❌ Contact creation failed`);
    }

  } catch (error) {
    console.error(`\n💥 Error: ${error}`);
  }
}

if (require.main === module) {
  testContactCreation().catch(console.error);
}
