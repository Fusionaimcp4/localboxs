import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variables Check:');
console.log('FUSION_BASE_URL:', process.env.FUSION_BASE_URL);
console.log('FUSION_API_KEY length:', process.env.FUSION_API_KEY?.length || 'undefined');
console.log('FUSION_API_KEY starts with:', process.env.FUSION_API_KEY?.substring(0, 10) || 'undefined');

// Test if the API key is properly loaded
if (!process.env.FUSION_API_KEY) {
  console.log('❌ FUSION_API_KEY is not loaded');
} else if (process.env.FUSION_API_KEY.length < 20) {
  console.log('❌ FUSION_API_KEY appears to be truncated (too short)');
} else {
  console.log('✅ FUSION_API_KEY appears to be loaded correctly');
}
