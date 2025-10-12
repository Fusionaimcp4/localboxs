/**
 * Generate an encryption key for integration credentials
 * Run this once and add the key to your .env file
 */

import { generateEncryptionKey } from '../lib/integrations/encryption';

console.log('\n🔐 Generating Integration Encryption Key\n');
console.log('Add this to your .env file:\n');
console.log(`INTEGRATION_ENCRYPTION_KEY=${generateEncryptionKey()}\n`);
console.log('⚠️  Keep this key secure and never commit it to version control!\n');

