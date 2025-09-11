#!/usr/bin/env tsx

/**
 * Test script for Chatwoot Lead API
 * Tests the /api/demo/lead endpoint functionality
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || `http://${process.env.DEMO_DOMAIN || 'localhost:3000'}`;

interface TestLead {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  consent?: boolean;
}

interface TestDemo {
  slug: string;
  business_url: string;
  demo_url?: string;
  system_message_file?: string;
  inbox_id?: number;
}

async function testLeadAPI() {
  console.log('🧪 Testing Chatwoot Lead API...\n');

  const testLead: TestLead = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    company: 'Test Company',
    phone: `+1234567${Date.now().toString().slice(-4)}`,
    consent: true
  };

  const testDemo: TestDemo = {
    slug: 'test-company',
    business_url: 'https://example.com',
    demo_url: 'https://demo.example.com',
    system_message_file: '/system-message/test.md',
    inbox_id: 1 // Use a test inbox ID
  };

  const payload = {
    lead: testLead,
    demo: testDemo
  };

  try {
    console.log('📤 Sending lead creation request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${BASE_URL}/api/demo/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`\n📥 Response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Lead creation successful!');
      console.log(`Contact ID: ${responseData.contact_id}`);
      console.log(`Associated Inbox ID: ${responseData.associated_inbox_id}`);
      console.log(`Is New Contact: ${responseData.is_new_contact}`);
    } else {
      console.log('\n❌ Lead creation failed!');
      console.log('Error:', responseData.error);
      if (responseData.details) {
        console.log('Details:', responseData.details);
      }
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  }
}

async function testDuplicateLead() {
  console.log('\n🔄 Testing duplicate lead handling...\n');

  const testLead: TestLead = {
    name: 'Duplicate Test User',
    email: `duplicate-${Date.now()}@example.com`,
    company: 'Duplicate Company',
    phone: `+1234567${Date.now().toString().slice(-4)}`,
    consent: true
  };

  const testDemo: TestDemo = {
    slug: 'duplicate-company',
    business_url: 'https://duplicate.com',
    demo_url: 'https://demo.duplicate.com',
    system_message_file: '/system-message/duplicate.md',
    inbox_id: 1
  };

  const payload = {
    lead: testLead,
    demo: testDemo
  };

  try {
    // First request - should create new contact
    console.log('📤 First request (should create new contact)...');
    const response1 = await fetch(`${BASE_URL}/api/demo/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data1 = await response1.json();
    console.log(`First response: ${response1.status} - Contact ID: ${data1.contact_id}, Is New: ${data1.is_new_contact}`);

    // Second request - should update existing contact
    console.log('\n📤 Second request (should update existing contact)...');
    const response2 = await fetch(`${BASE_URL}/api/demo/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data2 = await response2.json();
    console.log(`Second response: ${response2.status} - Contact ID: ${data2.contact_id}, Is New: ${data2.is_new_contact}`);

    if (data1.contact_id === data2.contact_id && data1.is_new_contact && !data2.is_new_contact) {
      console.log('\n✅ Duplicate handling works correctly!');
    } else {
      console.log('\n❌ Duplicate handling failed!');
    }

  } catch (error) {
    console.error('\n💥 Duplicate test failed:', error);
  }
}

async function testInvalidData() {
  console.log('\n🚫 Testing invalid data handling...\n');

  const invalidPayloads = [
    { lead: { name: 'Test' }, demo: { slug: 'test' } }, // Missing email
    { lead: { email: 'test@example.com' }, demo: { slug: 'test' } }, // Missing name
    { lead: { name: 'Test', email: 'test@example.com' }, demo: {} }, // Missing demo data
  ];

  for (let i = 0; i < invalidPayloads.length; i++) {
    const payload = invalidPayloads[i];
    console.log(`📤 Testing invalid payload ${i + 1}...`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/demo/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log(`Response: ${response.status} - ${data.error || 'Success'}`);

      if (response.status === 400) {
        console.log('✅ Correctly rejected invalid data');
      } else {
        console.log('❌ Should have rejected invalid data');
      }
    } catch (error) {
      console.log('💥 Request failed:', error);
    }
    console.log('');
  }
}

async function main() {
  console.log('🚀 Starting Chatwoot Lead API Tests\n');
  console.log('Base URL:', BASE_URL);
  console.log('Make sure your development server is running!\n');

  await testLeadAPI();
  await testDuplicateLead();
  await testInvalidData();

  console.log('\n🏁 Tests completed!');
}

if (require.main === module) {
  main().catch(console.error);
}
