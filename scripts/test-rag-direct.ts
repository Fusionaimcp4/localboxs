/**
 * Test RAG Setup Directly (bypassing HTTP)
 */

import { prisma } from '../lib/prisma';

async function testRAG() {
  const demoId = 'cmgo8jeey0001ifrksj4ps5n7'; // melangefoods

  console.log('🧪 Testing RAG Setup...\n');

  // Find workflow
  const workflow = await prisma.workflow.findFirst({
    where: { demoId },
    include: {
      demo: true,
      knowledgeBases: {
        where: { isActive: true },
        include: {
          knowledgeBase: true,
        },
      },
    },
  });

  if (!workflow) {
    console.log('❌ Workflow not found for demo:', demoId);
    return;
  }

  console.log('✅ Workflow found:', workflow.demo?.businessName);
  console.log('   Workflow ID:', workflow.id);
  console.log('   Demo ID:', workflow.demoId);
  console.log('   Assigned KBs:', workflow.knowledgeBases.length);

  for (const wkb of workflow.knowledgeBases) {
    console.log(`\n📚 KB: ${wkb.knowledgeBase.name}`);
    console.log(`   ID: ${wkb.knowledgeBaseId}`);
    console.log(`   Priority: ${wkb.priority}`);
    console.log(`   Retrieval Limit: ${wkb.retrievalLimit}`);
    console.log(`   Similarity Threshold: ${wkb.similarityThreshold}`);

    // Get documents
    const docs = await prisma.document.findMany({
      where: {
        knowledgeBaseId: wkb.knowledgeBaseId,
        status: 'COMPLETED',
      },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });

    console.log(`\n   📄 Documents: ${docs.length}`);
    for (const doc of docs) {
      console.log(`      • ${doc.originalName}: ${doc._count.chunks} chunks`);
    }

    // Get some chunks
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          knowledgeBaseId: wkb.knowledgeBaseId,
          status: 'COMPLETED',
        },
      },
      take: 3,
    });

    console.log(`\n   🧩 Sample Chunks: ${chunks.length}`);
    for (const chunk of chunks) {
      console.log(`      • Chunk ${chunk.chunkIndex}: ${chunk.content.substring(0, 100)}...`);
      console.log(`        Has embedding: ${chunk.embedding ? 'Yes' : 'No'}`);
    }
  }

  await prisma.$disconnect();
}

testRAG().catch(console.error);

