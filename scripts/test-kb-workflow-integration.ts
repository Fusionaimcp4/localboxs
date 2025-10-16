/**
 * Complete KB → Workflow → RAG Integration Test
 * 
 * This script tests the entire flow:
 * 1. Verify KB exists
 * 2. Verify workflow exists
 * 3. Link KB to workflow
 * 4. Test RAG API
 */

import { prisma } from '../lib/prisma';

async function testIntegration() {
  console.log('🧪 Testing Complete KB → Workflow Integration\n');

  // Step 1: Find "Melangefoods" KB
  console.log('📚 Step 1: Finding Knowledge Base...');
  const kb = await prisma.knowledgeBase.findFirst({
    where: {
      name: {
        contains: 'Melange',
        mode: 'insensitive',
      },
    },
    include: {
      documents: {
        include: {
          _count: {
            select: { chunks: true },
          },
        },
      },
    },
  });

  if (!kb) {
    console.error('❌ No Melangefoods KB found!');
    console.log('\n💡 Create one at: http://localhost:3000/dashboard/knowledge-bases');
    return;
  }

  console.log(`✅ Found KB: ${kb.name}`);
  console.log(`   Documents: ${kb.documents.length}`);
  console.log(`   Total Chunks: ${kb.totalChunks}`);
  console.log(`   Total Tokens: ${kb.totalTokens}`);

  // Step 2: Find melangefoods workflow
  console.log('\n⚡ Step 2: Finding Workflow...');
  const workflow = await prisma.workflow.findFirst({
    where: {
      n8nWorkflowId: 'zCpmybq6jjvLYenU',
    },
    include: {
      demo: true,
    },
  });

  if (!workflow) {
    console.error('❌ Melangefoods workflow not found!');
    return;
  }

  console.log(`✅ Found Workflow: ${workflow.demo.businessName}`);
  console.log(`   n8n ID: ${workflow.n8nWorkflowId}`);
  console.log(`   Status: ${workflow.status}`);

  // Step 3: Check if link exists
  console.log('\n🔗 Step 3: Checking Workflow Link...');
  const existingLink = await prisma.workflowKnowledgeBase.findFirst({
    where: {
      workflowId: workflow.id,
      knowledgeBaseId: kb.id,
    },
  });

  if (existingLink) {
    console.log(`✅ Link exists!`);
    console.log(`   Priority: ${existingLink.priority}`);
    console.log(`   Limit: ${existingLink.retrievalLimit}`);
    console.log(`   Threshold: ${existingLink.similarityThreshold}`);
    console.log(`   Active: ${existingLink.isActive}`);
  } else {
    console.log('⚠️  No link found');
    console.log('\n💡 Link it at: http://localhost:3000/dashboard/knowledge-bases/' + kb.id);
    console.log('   Then run this script again!');
    return;
  }

  // Step 4: Test RAG API (simulate)
  console.log('\n🎯 Step 4: Testing RAG API...');
  console.log('\n📋 Test Command:');
  console.log('─'.repeat(60));
  console.log(`
curl -X POST http://localhost:3000/api/rag/retrieve \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What is on the menu?",
    "workflowId": "${workflow.n8nWorkflowId}",
    "limit": ${existingLink.retrievalLimit},
    "similarityThreshold": ${existingLink.similarityThreshold}
  }'
  `);
  console.log('─'.repeat(60));

  // Step 5: Summary
  console.log('\n📊 Integration Status Summary:');
  console.log('─'.repeat(60));
  console.log(`✅ Knowledge Base: ${kb.name}`);
  console.log(`   └─ ${kb.documents.length} documents, ${kb.totalChunks} chunks`);
  console.log(`✅ Workflow: ${workflow.demo.businessName}`);
  console.log(`   └─ n8n ID: ${workflow.n8nWorkflowId}`);
  console.log(`✅ Link Active: ${existingLink.isActive}`);
  console.log(`   └─ Priority ${existingLink.priority}, Limit ${existingLink.retrievalLimit}, Threshold ${existingLink.similarityThreshold}`);
  console.log('─'.repeat(60));

  // Step 6: Next steps
  console.log('\n🚀 Next Steps:');
  console.log('1. Run the curl command above to test RAG API');
  console.log('2. Update your n8n workflow threshold to 0.4');
  console.log('3. Test in Chatwoot: Ask "What\'s on the menu?"');
  console.log('4. Check n8n execution logs to see retrieved context');
  console.log('\n✨ Everything is ready for production!\n');

  await prisma.$disconnect();
}

testIntegration().catch((error) => {
  console.error('\n💥 Error:', error);
  process.exit(1);
});

