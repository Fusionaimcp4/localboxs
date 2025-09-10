/**
 * Test script for the improved fetch resilience
 */

import { fetchAndClean } from '../lib/scrape';

async function testFetchResilience() {
  console.log('🧪 Testing fetch resilience with various URLs...');
  
  const testUrls = [
    'https://httpbin.org/delay/2', // Should work - delayed response
    'https://expired.badssl.com/', // SSL certificate expired
    'https://self-signed.badssl.com/', // Self-signed certificate
    'https://nonexistent-domain-12345.com/', // DNS error
    'https://httpbin.org/status/404', // HTTP 404
    'https://httpbin.org/status/500', // HTTP 500
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing: ${url}`);
    try {
      const result = await fetchAndClean(url);
      console.log(`✅ Success: ${result.cleanedText.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n🎯 Testing completed. The system should handle various network issues gracefully.');
}

// Run the test
testFetchResilience().catch(console.error);
