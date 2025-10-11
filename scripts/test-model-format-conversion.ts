import dotenv from 'dotenv';
import { getFusionModels, convertToN8nModelFormat } from '../lib/fusion-api';

// Load environment variables
dotenv.config();

async function testModelFormatConversion() {
  console.log('🧪 Testing model format conversion for n8n compatibility...\n');

  try {
    // Get available models
    const models = await getFusionModels();
    console.log(`📋 Testing conversion for ${models.length} active models:\n`);

    // Test conversion for first 5 models
    const testModels = models.slice(0, 5);
    
    for (const model of testModels) {
      console.log(`🔄 Converting: ${model.id_string}`);
      const n8nFormat = await convertToN8nModelFormat(model.id_string);
      console.log(`   ✅ Result: "${n8nFormat}"`);
      console.log(`   📝 Original: ${model.provider} - ${model.name}`);
      console.log('');
    }

    // Test specific examples
    console.log('🎯 Testing specific examples:');
    const examples = [
      'openai/gpt-4o',
      'anthropic/claude-3-haiku',
      'google/gemini-1.5-flash'
    ];

    for (const example of examples) {
      try {
        const n8nFormat = await convertToN8nModelFormat(example);
        console.log(`   ${example} -> "${n8nFormat}"`);
      } catch (error) {
        console.log(`   ${example} -> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n🎉 Model format conversion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testModelFormatConversion();
