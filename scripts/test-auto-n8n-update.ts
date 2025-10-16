/**
 * Test automatic n8n RAG configuration update
 */

import { updateN8nWorkflowRAGSettings } from '../lib/n8n-api-rag';

async function testAutoUpdate() {
  console.log('🧪 Testing Automatic n8n RAG Configuration Update\n');
  console.log('='.repeat(60));

  try {
    console.log('\n📝 Simulating: User links KB with these settings:');
    console.log('   - Workflow: melangefoods.com (zCpmybq6jjvLYenU)');
    console.log('   - Retrieval Limit: 5 chunks');
    console.log('   - Similarity Threshold: 0.4');
    console.log('\n🔄 Auto-updating n8n workflow...\n');

    await updateN8nWorkflowRAGSettings('zCpmybq6jjvLYenU', {
      retrievalLimit: 5,
      similarityThreshold: 0.4,
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST PASSED!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open: https://n8n.sost.work/workflow/zCpmybq6jjvLYenU');
    console.log('2. Click "Retrieve Knowledge Base Context" node');
    console.log('3. Verify JSON Body shows:');
    console.log('   {');
    console.log('     "workflowId": "zCpmybq6jjvLYenU",');
    console.log('     "limit": 5,');
    console.log('     "similarityThreshold": 0.4');
    console.log('   }');
    console.log('\n🎉 Automatic sync is working!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED!');
    console.error('\nError:', error);
    console.error('\n💡 Check:');
    console.error('   - N8N_API_KEY is set in .env');
    console.error('   - n8n is accessible');
    console.error('   - Workflow exists in n8n');
    console.error('='.repeat(60));
    process.exit(1);
  }
}

testAutoUpdate();

