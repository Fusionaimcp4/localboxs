# 🤖 n8n RAG Integration Guide

## Quick Start: Add Knowledge Base Context to Your n8n Workflows

### **Step 1: Prepare Your Environment**

1. **Set OpenAI API Key** in your `.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Optional: Set RAG API Key** for security:
   ```bash
   RAG_API_KEY=your-secret-key-here
   ```

3. **Restart your Next.js application**:
   ```bash
   npm run dev
   ```

---

### **Step 2: Create and Upload Knowledge Base**

1. Navigate to: `http://localhost:3001/dashboard/system-messages`
2. Click **"Knowledge Base"** button (top right)
3. Click **"Create Knowledge Base"**
4. Enter name: e.g., "Product Documentation"
5. Upload your documents (PDF, DOCX, TXT, etc.)
6. Wait for processing to complete (status: PENDING → PROCESSING → COMPLETED)

---

### **Step 3: Assign Knowledge Base to Workflow**

#### **Option A: Via Database (Manual)**

Connect your knowledge base to a workflow using the database:

```sql
INSERT INTO workflow_knowledge_bases (
  id,
  workflow_id,
  knowledge_base_id,
  priority,
  retrieval_limit,
  similarity_threshold,
  is_active,
  assigned_at
) VALUES (
  'wkb-' || gen_random_uuid(),  -- Generate random ID
  'your-workflow-id',            -- From workflows table
  'your-kb-id',                  -- From knowledge_bases table
  1,                             -- Priority (lower = higher priority)
  5,                             -- How many chunks to retrieve
  0.7,                           -- Similarity threshold (0-1)
  true,                          -- Active
  NOW()                          -- Current timestamp
);
```

#### **Option B: Via UI (Coming in Phase 3)**

Future feature: Assign KBs directly from the UI.

---

### **Step 4: Add RAG Node to n8n Workflow**

#### **Method 1: HTTP Request Node (Recommended)**

1. **Add an HTTP Request node** to your workflow
2. **Name it**: "Retrieve Knowledge Base Context"
3. **Configure**:

```
Method: POST
URL: https://your-domain.com/api/rag/retrieve

Headers:
  Content-Type: application/json

Body (JSON):
{
  "query": "{{ $json.userMessage }}",
  "workflowId": "your-workflow-id",
  "limit": 5,
  "similarityThreshold": 0.7
}
```

4. **Optional: Add API Key Authentication**:

```json
{
  "query": "{{ $json.userMessage }}",
  "workflowId": "your-workflow-id",
  "apiKey": "your-secret-key"
}
```

#### **Alternative: Use Demo ID**

If you don't have the workflow ID, use the demo ID:

```json
{
  "query": "{{ $json.userMessage }}",
  "demoId": "your-demo-id"
}
```

---

### **Step 5: Inject Context into AI Prompt**

#### **Update Your OpenAI/AI Node**

**Before (without RAG):**
```
System: {{ $json.systemMessage }}

User: {{ $json.userMessage }}
```

**After (with RAG):**
```
System: {{ $json.systemMessage }}

{{ $('Retrieve Knowledge Base Context').item.json.context }}

User: {{ $json.userMessage }}
```

The `context` field contains pre-formatted, relevant chunks from your knowledge base!

---

## 📋 **Complete n8n Workflow Example**

### **Workflow Structure:**

```
1. Webhook Trigger
   ↓
2. Set Initial Data
   ↓
3. Retrieve Knowledge Base Context (HTTP Request)
   ↓
4. OpenAI Chat (with context)
   ↓
5. Respond to User
```

---

### **Node Details:**

#### **1. Webhook Trigger**
```json
{
  "httpMethod": "POST",
  "path": "chat"
}
```

#### **2. Set Initial Data**
```javascript
return [
  {
    json: {
      userMessage: $input.item.json.message,
      workflowId: $workflow.id,
      systemMessage: "You are a helpful AI assistant..."
    }
  }
];
```

#### **3. HTTP Request - RAG Retrieval**
```
Method: POST
URL: https://your-domain.com/api/rag/retrieve

Body:
{
  "query": "{{ $json.userMessage }}",
  "workflowId": "{{ $json.workflowId }}",
  "limit": 5,
  "similarityThreshold": 0.7
}

Response Format: JSON
```

#### **4. OpenAI Chat**
```
Model: gpt-4o-mini

Messages:
[
  {
    "role": "system",
    "content": "{{ $('Set Initial Data').item.json.systemMessage }}\n\n{{ $json.context }}"
  },
  {
    "role": "user",
    "content": "{{ $('Set Initial Data').item.json.userMessage }}"
  }
]
```

#### **5. Respond**
```javascript
return [
  {
    json: {
      response: $input.item.json.choices[0].message.content,
      sources: $('HTTP Request').item.json.results.map(r => r.documentName)
    }
  }
];
```

---

## 🎯 **API Response Structure**

### **Success Response:**

```json
{
  "success": true,
  "context": "### Relevant Knowledge Base Context:\n\n[Source 1: Product Guide.pdf]\nOur refund policy allows...\n\n[Source 2: FAQ.docx]\nYou can request a refund within...\n\n---\n\n",
  "results": [
    {
      "content": "Our refund policy allows customers to return products within 30 days...",
      "similarity": 0.92,
      "documentName": "Product Guide.pdf",
      "knowledgeBaseName": "Product Documentation",
      "chunkIndex": 5,
      "section": "Refund Policy"
    },
    {
      "content": "You can request a refund by contacting our support team...",
      "similarity": 0.87,
      "documentName": "FAQ.docx",
      "knowledgeBaseName": "Customer Support",
      "chunkIndex": 12,
      "section": null
    }
  ],
  "metadata": {
    "query": "What is your refund policy?",
    "workflowId": "wf-abc123",
    "demoId": "demo-xyz789",
    "totalChunksSearched": 245,
    "knowledgeBasesSearched": 2,
    "resultsReturned": 2,
    "similarityThreshold": 0.7
  }
}
```

### **Error Response:**

```json
{
  "error": "Failed to retrieve context",
  "details": "Workflow not found"
}
```

---

## 🔧 **Configuration Options**

### **RAG Retrieval Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | *required* | The user's question/message |
| `workflowId` | string | optional | Workflow ID (from workflows table) |
| `demoId` | string | optional | Demo ID (alternative to workflowId) |
| `limit` | number | `5` | Number of chunks to retrieve |
| `similarityThreshold` | number | `0.7` | Minimum similarity (0-1) |
| `apiKey` | string | optional | Authentication key |

### **Similarity Threshold Guide:**

- **0.9 - 1.0**: Very strict (only near-exact matches)
- **0.7 - 0.9**: Balanced (recommended)
- **0.5 - 0.7**: Loose (more results, less relevant)
- **< 0.5**: Very loose (many irrelevant results)

---

## 🎨 **Advanced Usage**

### **1. Multiple Knowledge Bases**

If your workflow is assigned multiple KBs, they're searched in priority order:

```sql
-- Assign multiple KBs with priorities
INSERT INTO workflow_knowledge_bases (workflow_id, knowledge_base_id, priority, ...)
VALUES 
  ('wf-123', 'kb-product-docs', 1, ...),  -- Search first
  ('wf-123', 'kb-faqs', 2, ...),          -- Search second
  ('wf-123', 'kb-policies', 3, ...);      -- Search third
```

### **2. Conditional RAG**

Only retrieve context for certain queries:

```javascript
// In n8n "Switch" node
if ($json.userMessage.toLowerCase().includes('policy') || 
    $json.userMessage.toLowerCase().includes('how to')) {
  // Route to RAG retrieval
} else {
  // Skip RAG, go straight to AI
}
```

### **3. Fallback Strategy**

Handle cases where no relevant context is found:

```javascript
// Check if context was retrieved
const context = $('HTTP Request').item.json.context;

if (context && context.length > 50) {
  // Use RAG-enhanced prompt
  return {
    prompt: `${systemMessage}\n\n${context}\n\nUser: ${userMessage}`
  };
} else {
  // Use standard prompt
  return {
    prompt: `${systemMessage}\n\nUser: ${userMessage}`
  };
}
```

### **4. Source Citations**

Show users where the information came from:

```javascript
const response = $('OpenAI').item.json.choices[0].message.content;
const sources = $('HTTP Request').item.json.results;

const citations = sources.map((s, i) => 
  `[${i+1}] ${s.documentName}`
).join('\n');

return {
  response: response,
  footer: `\n\n---\nSources:\n${citations}`
};
```

---

## 🐛 **Troubleshooting**

### **Problem: "Workflow not found"**

**Solution:**
- Verify workflow ID exists in database
- Or use `demoId` instead
- Check workflow is associated with a demo

### **Problem: "No knowledge bases found"**

**Solution:**
- Assign at least one KB to the workflow
- Verify KB is marked as `isActive: true`
- Check knowledge base belongs to the workflow's user

### **Problem: No results returned**

**Solution:**
- Lower the `similarityThreshold` (try 0.5)
- Ensure documents are fully processed (status: COMPLETED)
- Check that documents contain relevant information
- Try a more specific query

### **Problem: Processing takes too long**

**Solution:**
- Check document size (large PDFs take longer)
- Verify OpenAI API key is valid
- Check server logs for errors
- Ensure database is responsive

---

## 📊 **Monitoring & Analytics**

### **Check Processing Status:**

```sql
SELECT 
  d.original_name,
  d.status,
  d.word_count,
  COUNT(dc.id) as chunk_count,
  d.processing_error
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.knowledge_base_id = 'your-kb-id'
GROUP BY d.id;
```

### **View Workflow KB Assignments:**

```sql
SELECT 
  w.id as workflow_id,
  d.business_name as demo_name,
  kb.name as kb_name,
  wkb.priority,
  wkb.retrieval_limit,
  wkb.similarity_threshold
FROM workflow_knowledge_bases wkb
JOIN workflows w ON w.id = wkb.workflow_id
JOIN knowledge_bases kb ON kb.id = wkb.knowledge_base_id
JOIN demos d ON d.id = w.demo_id
WHERE wkb.is_active = true
ORDER BY w.id, wkb.priority;
```

---

## 🚀 **Production Checklist**

Before deploying to production:

- [ ] Set `OPENAI_API_KEY` in production environment
- [ ] Set `RAG_API_KEY` for API security
- [ ] Test RAG retrieval with sample queries
- [ ] Verify all documents are processed (status: COMPLETED)
- [ ] Assign knowledge bases to workflows
- [ ] Test n8n workflow end-to-end
- [ ] Monitor OpenAI usage/costs
- [ ] Set up error logging
- [ ] Configure rate limiting (optional)
- [ ] Test with various similarity thresholds

---

## 💡 **Best Practices**

1. **Organize Knowledge Bases by Topic**
   - One KB per product/service
   - Separate KBs for policies, FAQs, technical docs

2. **Optimal Document Size**
   - 5-50 pages per document
   - Break large PDFs into smaller sections

3. **Good Chunk Size**
   - Default 1000 tokens works for most cases
   - Increase for technical documentation
   - Decrease for conversational content

4. **Quality Over Quantity**
   - 10 high-quality documents > 100 low-quality
   - Clean, well-formatted content performs better

5. **Test Queries**
   - Test with real user questions
   - Adjust similarity threshold based on results
   - Monitor which documents are being retrieved

---

## 🎯 **Example Use Cases**

### **1. Customer Support Bot**
```
Knowledge Bases:
  - Product Manual
  - FAQ
  - Troubleshooting Guide

Query: "How do I reset my device?"
Result: Retrieves relevant steps from all three KBs
```

### **2. Sales Assistant**
```
Knowledge Bases:
  - Product Catalog
  - Pricing Guide
  - Case Studies

Query: "Tell me about your premium features"
Result: Retrieves feature descriptions and pricing
```

### **3. Internal Knowledge Base**
```
Knowledge Bases:
  - Company Policies
  - HR Handbook
  - Onboarding Guide

Query: "What is the vacation policy?"
Result: Retrieves relevant policy sections
```

---

## 📞 **Support**

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify database connections
3. Test OpenAI API key with a simple request
4. Ensure documents are fully processed
5. Review n8n workflow execution logs

---

## 🎉 **You're Ready!**

Your AI assistant now has access to your entire knowledge base!

**Next Steps:**
1. Upload your documents
2. Assign KBs to workflows
3. Update your n8n workflow
4. Test with real queries
5. Deploy to production

Happy building! 🚀

