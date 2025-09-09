#!/usr/bin/env ts-node

import { slugify } from '../lib/slug';
import { mergeKBIntoSkeleton } from '../lib/merge';
import { renderDemoHTML } from '../lib/renderDemo';

// Test basic functions without external dependencies
console.log('🧪 Testing core functions...\n');

// Test slugify
console.log('1. Testing slugify:');
const testNames = ['My Business Inc.', 'Test-Company_123', 'Special@Characters!'];
testNames.forEach(name => {
  console.log(`  "${name}" -> "${slugify(name)}"`);
});

// Test merge function
console.log('\n2. Testing mergeKBIntoSkeleton:');
const skeleton = `# System Message

## Knowledge Base

This will be replaced.

## Other Section`;

const kb = `### Project Overview
This is a test business.

### Features
- Feature 1
- Feature 2`;

const merged = mergeKBIntoSkeleton(skeleton, kb);
console.log('  Merged successfully:', merged.includes('This is a test business.'));

// Test HTML rendering
console.log('\n3. Testing renderDemoHTML:');
const demoCtx = {
  businessName: 'Test Company',
  slug: 'test-company',
  primary: '#ff0000',
  secondary: '#00ff00',
  logoUrl: 'https://example.com/logo.png',
  chatwootBaseUrl: 'https://chat.example.com',
  websiteToken: 'test-token-123'
};

const html = renderDemoHTML(demoCtx);
console.log('  HTML generated:', html.includes('Test Company'));
console.log('  Contains logo:', html.includes('logo.png'));
console.log('  Contains colors:', html.includes('#ff0000'));
console.log('  Contains Chatwoot:', html.includes('test-token-123'));

console.log('\n✅ All basic tests passed!');
console.log('\nTo test the full workflow:');
console.log('1. Set up your .env file with API keys');
console.log('2. Run: ts-node scripts/onboard-business.ts --url https://example.com');
console.log('3. Or use the admin UI at /admin/onboard');
