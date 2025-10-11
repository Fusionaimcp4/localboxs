import dotenv from 'dotenv';
import { getFusionModels, validateFusionModel, getModelDisplayName } from '../lib/fusion-api';

// Load environment variables
dotenv.config();

async function testFusionAPI() {
  console.log('🧪 Testing Fusion API integration...\n');

  try {
    // Test 1: Fetch available models
    console.log('1️⃣ Fetching available models from Fusion...');
    const models = await getFusionModels();
    console.log(`✅ Retrieved ${models.length} models`);
    
    // Show first few models
    console.log('\n📋 Available models (first 5):');
    models.slice(0, 5).forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.name} (${model.id_string})`);
      console.log(`     Provider: ${model.provider}`);
      console.log(`     Active: ${model.is_active}`);
      console.log(`     Context: ${model.context_length_tokens.toLocaleString()} tokens`);
      console.log('');
    });

    // Test 2: Validate a specific model
    if (models.length > 0) {
      const testModel = models[0].id_string;
      console.log(`2️⃣ Validating model: ${testModel}`);
      const isValid = await validateFusionModel(testModel);
      console.log(`✅ Model validation: ${isValid ? 'Valid' : 'Invalid'}`);
    }

    // Test 3: Get display name
    if (models.length > 0) {
      const testModel = models[0].id_string;
      console.log(`\n3️⃣ Getting display name for: ${testModel}`);
      const displayName = await getModelDisplayName(testModel);
      console.log(`✅ Display name: ${displayName}`);
    }

    console.log('\n🎉 All Fusion API tests completed successfully!');

  } catch (error) {
    console.error('❌ Fusion API test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('FUSION_API_KEY')) {
        console.log('\n💡 Make sure to set FUSION_API_KEY in your .env file');
      }
      if (error.message.includes('Fusion API error')) {
        console.log('\n💡 Check your FUSION_BASE_URL and API key configuration');
      }
    }
  }
}

testFusionAPI();
