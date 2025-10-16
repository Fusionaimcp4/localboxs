async function testRAGAPI() {
  console.log('🧪 Testing RAG API with lower threshold...\n');

  const tests = [
    { query: 'What is on the menu?', threshold: 0.3 },
    { query: 'Tell me about Melange Foods', threshold: 0.3 },
    { query: 'What are the hours?', threshold: 0.3 },
    { query: 'food menu', threshold: 0.3 },
  ];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Query: "${test.query}"`);
    console.log(`Threshold: ${test.threshold}`);
    console.log('='.repeat(60));

    const testPayload = {
      query: test.query,
      workflowId: 'zCpmybq6jjvLYenU',
      limit: 3,
      similarityThreshold: test.threshold,
    };

    try {
      const response = await fetch('http://localhost:3000/api/rag/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`\n✅ Results: ${data.results?.length || 0} chunks`);
        
        if (data.results && data.results.length > 0) {
          for (let i = 0; i < data.results.length; i++) {
            const result = data.results[i];
            console.log(`\n📄 Chunk ${i + 1}:`);
            console.log(`   Similarity: ${result.similarity?.toFixed(4) || 'N/A'}`);
            console.log(`   Document: ${result.documentName}`);
            console.log(`   Preview: ${result.content.substring(0, 150)}...`);
          }
        } else {
          console.log('\n⚠️  No results found even with low threshold');
        }
      } else {
        console.error(`\n❌ Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(text);
      }
    } catch (error) {
      console.error('\n💥 Request failed:', error);
    }
  }
}

testRAGAPI();

