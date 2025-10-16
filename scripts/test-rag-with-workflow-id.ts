async function testRAGAPI() {
  console.log('🧪 Testing RAG API with workflowId...\n');

  const testPayload = {
    query: 'What is on the menu?',
    workflowId: 'zCpmybq6jjvLYenU', // Your melangefoods.com workflow
    limit: 5,
    similarityThreshold: 0.4,
  };

  console.log('📤 Request:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/rag/retrieve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    console.log('\n📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('\n📄 Raw Response Body:');
    console.log(text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ SUCCESS! Retrieved chunks:', data.chunks?.length || 0);
      if (data.chunks && data.chunks.length > 0) {
        console.log('\n📚 First chunk preview:');
        console.log(data.chunks[0].content.substring(0, 200) + '...');
      }
    } else {
      console.error('\n❌ ERROR Response');
      try {
        const errorData = JSON.parse(text);
        console.error('Error details:', errorData);
      } catch {
        console.error('Could not parse error as JSON');
      }
    }
  } catch (error) {
    console.error('\n💥 Request failed:', error);
  }
}

testRAGAPI();

