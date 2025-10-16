# 🔍 How RAG Works in Your System

## 📊 **Complete Visual Flow**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PHASE 1: DOCUMENT UPLOAD                        │
└─────────────────────────────────────────────────────────────────────────┘

User Dashboard
    ↓
Upload PDF/DOCX/TXT to Knowledge Base
    ↓
📁 Saved to: /public/kb-uploads/[userId]/[filename]
    ↓
Database Record Created
    └─ Table: documents
       ├─ status: "PENDING"
       ├─ filePath: "/public/kb-uploads/..."
       ├─ chunkSize: 1000 tokens
       └─ chunkOverlap: 200 tokens


┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: ASYNC PROCESSING                            │
└─────────────────────────────────────────────────────────────────────────┘

Background Job: processDocument(documentId)
    ↓
STEP 1: TEXT EXTRACTION
    ├─ PDF → lib/knowledge-base/pdf-extractor.ts (using 'unpdf')
    ├─ DOCX → lib/knowledge-base/docx-extractor.ts (using 'mammoth')
    └─ TXT/MD → Direct read
    ↓
Result: Plain text string
    Example: "Welcome to our restaurant! We serve Mediterranean cuisine..."
    ↓
Update DB: status = "PROCESSING"


    ↓
STEP 2: SMART CHUNKING (lib/knowledge-base/chunking.ts)
    ↓
Decision Tree:
    ├─ Has headers (# Section)? → chunkTextBySections()
    ├─ Has paragraphs (\n\n)? → chunkTextByParagraphs()
    └─ Plain text? → chunkTextRecursive()
    ↓
Recursive Splitting:
    Separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ']
    ↓
    Try to split at natural boundaries
    ├─ Max chunk: 1000 tokens (~750 words)
    ├─ Overlap: 200 tokens (maintains context)
    └─ Min chunk: 100 tokens
    ↓
Result: Array of TextChunk objects
    [
      { content: "Welcome to our restaurant...", index: 0, tokenCount: 850 },
      { content: "...Mediterranean cuisine. Our menu...", index: 1, tokenCount: 920 },
      { content: "...Our hours are Monday-Friday...", index: 2, tokenCount: 450 }
    ]


    ↓
STEP 3: GENERATE EMBEDDINGS (OpenAI)
    ↓
For each chunk:
    ↓
    Send to OpenAI Embeddings API
    ├─ Model: "text-embedding-3-small"
    ├─ Input: chunk.content
    └─ Output format: "float"
    ↓
    OpenAI Returns: 1536-dimensional vector
    Example: [0.023, -0.041, 0.137, ..., 0.089] (1536 numbers)
    ↓
    Save to Database
    └─ Table: document_chunks
       ├─ content: "Welcome to our restaurant..."
       ├─ chunkIndex: 0
       ├─ tokenCount: 850
       ├─ embedding: [0.023, -0.041, ...] (JSON array)
       └─ embeddingModel: "text-embedding-3-small"
    ↓
    Console: "[Processor] Processed chunk 1/3"


    ↓
STEP 4: UPDATE DATABASE
    ↓
Document table:
    ├─ extractedText: "Full text..."
    ├─ wordCount: 2,450
    ├─ pageCount: 5
    └─ status: "COMPLETED" ✅
    ↓
Knowledge Base table (stats):
    ├─ totalDocuments: +1
    ├─ totalChunks: +3
    └─ totalTokens: +2,220


┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: WORKFLOW ASSIGNMENT                         │
└─────────────────────────────────────────────────────────────────────────┘

User on KB Detail Page
    ↓
Links KB to n8n workflow
    └─ POST /api/dashboard/knowledge-bases/[id]/link-workflow
       ├─ Creates: WorkflowKnowledgeBase record
       ├─ Sets: retrievalLimit = 5
       ├─ Sets: similarityThreshold = 0.7
       └─ Auto-updates n8n workflow (lib/n8n-api-rag.ts)
           ↓
           Updates "Retrieve Knowledge Base Context" node:
           ├─ URL: https://ac691440db0c.ngrok-free.app/api/rag/retrieve
           └─ JSON Body: {
                "query": "={{ $json.user_messages }}",  ← CRITICAL!
                "workflowId": "zCpmybq6jjvLYenU",
                "limit": 5,
                "similarityThreshold": 0.7
              }


┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: CHAT INTERACTION (RAG)                      │
└─────────────────────────────────────────────────────────────────────────┘

User sends message to chatbot
    ↓
n8n Workflow Receives:
    └─ AI Agent node gets:
       ├─ user_messages: "What is the price of Qibe Drenched Biscuit Muffin?"
       ├─ user_name: "John"
       └─ user_number: "+123456789"
    ↓
AI Agent Tool: "Retrieve Knowledge Base Context"
    ↓
    Evaluates expression: {{ $json.user_messages }}
    └─ Becomes: "What is the price of Qibe Drenched Biscuit Muffin?"
    ↓
    Makes HTTP POST to:
    └─ https://ac691440db0c.ngrok-free.app/api/rag/retrieve
       Body: {
         "query": "What is the price of Qibe Drenched Biscuit Muffin?",
         "workflowId": "zCpmybq6jjvLYenU",
         "limit": 5,
         "similarityThreshold": 0.7
       }


    ↓
RAG API Endpoint: /api/rag/retrieve
    ↓
STEP 1: Find Workflow & KBs
    ↓
    Query Database:
    └─ Find workflow by n8nWorkflowId = "zCpmybq6jjvLYenU"
       Include: linked Knowledge Bases (WorkflowKnowledgeBase)
       Filter: isActive = true
    ↓
    Result: workflow.knowledgeBases = [
      { knowledgeBaseId: "kb_123", retrievalLimit: 5, similarityThreshold: 0.7 }
    ]


    ↓
STEP 2: Generate Query Embedding
    ↓
    Send user query to OpenAI:
    └─ Model: "text-embedding-3-small"
       Input: "What is the price of Qibe Drenched Biscuit Muffin?"
       Output: [0.156, -0.092, 0.241, ..., 0.067] (1536 numbers)
    ↓
    Console: "[RAG] Generating embedding for query: 'What is the price of Qibe...'"


    ↓
STEP 3: Fetch All Chunks from Assigned KBs
    ↓
    Query Database:
    └─ Table: document_chunks
       WHERE:
       ├─ document.knowledgeBaseId IN ["kb_123"]
       ├─ document.status = "COMPLETED"
       └─ Include: document.knowledgeBase, document
    ↓
    Result: 47 chunks loaded into memory
    Console: "[RAG] Searching through 47 chunks for workflow zCpmybq6jjvLYenU"


    ↓
STEP 4: Calculate Cosine Similarity
    ↓
    For each chunk (1 to 47):
        ↓
        Extract: chunkEmbedding = chunk.embedding (1536 numbers)
        ↓
        Calculate Cosine Similarity:
        └─ Formula: cos(θ) = (A · B) / (||A|| × ||B||)
           ├─ Dot product: Σ(queryVec[i] × chunkVec[i])
           ├─ Normalize by vector magnitudes
           └─ Result: -1 to +1 (higher = more similar)
        ↓
        Examples:
        ├─ Chunk 12: "Menu items include Qibe Muffin $5.00..." → 0.89 ✅
        ├─ Chunk 5: "Our hours are Monday-Friday..." → 0.32 ❌
        └─ Chunk 23: "Side menu: Qibe Drenched Biscuit..." → 0.85 ✅


    ↓
STEP 5: Filter & Rank Results
    ↓
    Filter:
    └─ Keep only chunks where similarity >= 0.7 (threshold)
       ├─ Chunk 12: 0.89 ✅
       ├─ Chunk 23: 0.85 ✅
       └─ Chunk 5: 0.32 ❌ (filtered out)
    ↓
    Sort:
    └─ By similarity (descending): [0.89, 0.85, 0.78, ...]
    ↓
    Limit:
    └─ Take top 5 results (limit parameter)


    ↓
STEP 6: Format Context for AI
    ↓
    Create formatted string:
    
    ### Relevant Knowledge Base Context:
    
    [Source 1: menu.pdf - Side Menu]
    Side menu items:
    - Qibe Drenched Biscuit Muffin: $5.00
      Served with berbere butter and jam
    
    [Source 2: menu.pdf - Main Menu]
    Our signature items include the Qibe Drenched 
    Biscuit Muffin made fresh daily...
    
    ---
    
    ↓
    Return JSON to n8n:
    {
      "success": true,
      "context": "### Relevant Knowledge Base Context:\n\n[Source 1...]",
      "results": [
        {
          "content": "Side menu items:\n- Qibe...",
          "similarity": 0.89,
          "documentName": "menu.pdf",
          "knowledgeBaseName": "melangefoods KB",
          "chunkIndex": 12,
          "section": "Side Menu"
        },
        ...
      ],
      "metadata": {
        "totalChunksSearched": 47,
        "resultsReturned": 2,
        "similarityThreshold": 0.7
      }
    }


    ↓
n8n AI Agent Tool Returns:
    └─ context variable = "### Relevant Knowledge Base Context:\n\n..."
    ↓
AI Agent uses context in prompt:
    ↓
    System Message + RAG Context:
    
    You are a customer assistant for melangefoods.com.
    
    ### Relevant Knowledge Base Context:
    [Source 1: menu.pdf]
    - Qibe Drenched Biscuit Muffin: $5.00
    
    User Question: "What is the price of Qibe Drenched Biscuit Muffin?"
    ↓
    Send to OpenAI GPT-4
    ↓
    Response: "The price of the Qibe Drenched Biscuit Muffin 
               from the side menu is $5.00. It is served with 
               berbere butter and jam."


    ↓
Send to User via Chatwoot
    └─ ✅ Accurate answer with exact price!


┌─────────────────────────────────────────────────────────────────────────┐
│                           KEY COMPONENTS                                │
└─────────────────────────────────────────────────────────────────────────┘

1. **Text Extraction**
   Files: lib/knowledge-base/pdf-extractor.ts, docx-extractor.ts
   - PDF: Uses 'unpdf' (converts Buffer → Uint8Array)
   - DOCX: Uses 'mammoth' (converts to HTML, extracts text)
   - Result: Plain text string

2. **Smart Chunking**
   File: lib/knowledge-base/chunking.ts
   - Detects document structure (headers, paragraphs, plain text)
   - Splits at natural boundaries (paragraphs, sentences, punctuation)
   - Size: 1000 tokens per chunk (adjustable)
   - Overlap: 200 tokens (maintains context across chunks)
   - Result: Array of text chunks

3. **Embeddings (Vector Representation)**
   - Model: OpenAI "text-embedding-3-small"
   - Dimensions: 1536 numbers per chunk
   - Purpose: Converts text → mathematical representation
   - Enables semantic search (meaning-based, not keyword)

4. **Cosine Similarity**
   File: app/api/rag/retrieve/route.ts (lines 19-38)
   - Calculates angle between query vector and chunk vector
   - Range: -1 to 1 (higher = more similar)
   - Formula: cos(θ) = (A · B) / (||A|| × ||B||)
   - Example:
     • Query: "price of muffin" → [0.15, -0.09, ...]
     • Chunk: "Muffin costs $5" → [0.16, -0.08, ...] → 0.89 similarity ✅
     • Chunk: "Hours are 9-5" → [0.02, 0.31, ...] → 0.32 similarity ❌

5. **Workflow Assignment**
   File: app/api/dashboard/knowledge-bases/[id]/link-workflow/route.ts
   - Links KB to n8n workflow
   - Sets retrieval settings (limit, threshold)
   - Auto-updates n8n workflow via API

6. **RAG Retrieval API**
   File: app/api/rag/retrieve/route.ts
   - Receives query from n8n
   - Generates query embedding
   - Searches assigned KBs
   - Returns formatted context


┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────┘

knowledge_bases
├─ id (PK)
├─ userId
├─ name
├─ totalDocuments
├─ totalChunks
└─ totalTokens
    ↓
documents
├─ id (PK)
├─ knowledgeBaseId (FK)
├─ filename
├─ filePath
├─ extractedText
├─ status (PENDING, PROCESSING, COMPLETED, FAILED)
├─ chunkSize (default: 1000)
└─ chunkOverlap (default: 200)
    ↓
document_chunks
├─ id (PK)
├─ documentId (FK)
├─ content (text chunk)
├─ chunkIndex
├─ tokenCount
├─ embedding (JSON: [0.023, -0.041, ...])  ← 1536 numbers
└─ embeddingModel ("text-embedding-3-small")
    ↓
workflow_knowledge_bases (assignment table)
├─ id (PK)
├─ workflowId (FK)
├─ knowledgeBaseId (FK)
├─ retrievalLimit (default: 5)
├─ similarityThreshold (default: 0.7)
└─ isActive


┌─────────────────────────────────────────────────────────────────────────┐
│                         SETTINGS EXPLAINED                              │
└─────────────────────────────────────────────────────────────────────────┘

1. **Chunk Size** (1000 tokens)
   - How much text in each piece
   - Too small: Loses context
   - Too large: Less precise matching
   - 1000 tokens ≈ 750 words ≈ 3-4 paragraphs

2. **Chunk Overlap** (200 tokens)
   - How much text repeats between chunks
   - Ensures continuity across chunk boundaries
   - 200 tokens ≈ 150 words

3. **Retrieval Limit** (5 chunks)
   - How many chunks to return to AI
   - More chunks = more context but slower
   - Adjustable per workflow

4. **Similarity Threshold** (0.7)
   - Minimum similarity score to include chunk
   - Range: 0 to 1
   - 0.7 = Pretty relevant
   - 0.4 = More permissive
   - 0.9 = Very strict
   - Adjustable per workflow


┌─────────────────────────────────────────────────────────────────────────┐
│                    WHY COSINE SIMILARITY?                               │
└─────────────────────────────────────────────────────────────────────────┘

Traditional Keyword Search:
    Query: "What is the price of muffin?"
    ❌ Won't match: "Qibe costs $5.00" (different words)
    ✅ Will match: "price price price" (keyword spam)

Semantic Search (Cosine Similarity):
    Query: "What is the price of muffin?"
    ✅ Matches: "Qibe costs $5.00" (similar meaning!)
    ❌ Won't match: "price price price" (no semantic meaning)

How It Works:
    1. Convert text → vector (numbers representing meaning)
    2. Compare vectors mathematically
    3. Similar meanings → similar vectors → high score
    4. Different meanings → different vectors → low score

Example:
    Vectors in 2D (simplified from 1536D):
    
         "price" →  [0.8, 0.2]    ↗ small angle = high similarity
         "cost"  →  [0.7, 0.3]    ↗
    
         "hours" →  [0.2, 0.9]    ← large angle = low similarity


┌─────────────────────────────────────────────────────────────────────────┐
│                    EXAMPLE: FULL QUERY TRACE                            │
└─────────────────────────────────────────────────────────────────────────┘

User Question: "What is the price of Qibe Drenched Biscuit Muffin?"

1. n8n receives question
   └─ AI Agent tool: "Retrieve Knowledge Base Context"
   
2. Tool sends to RAG API:
   POST https://ac691440db0c.ngrok-free.app/api/rag/retrieve
   {
     "query": "What is the price of Qibe Drenched Biscuit Muffin?",
     "workflowId": "zCpmybq6jjvLYenU",
     "limit": 5,
     "similarityThreshold": 0.7
   }

3. RAG API finds workflow → Gets linked KBs → KB "melangefoods KB"

4. Generate query embedding:
   OpenAI: "What is the price..." → [0.156, -0.092, 0.241, ..., 0.067]

5. Load all 47 chunks from "melangefoods KB"

6. Calculate similarity for each:
   Chunk 1:  "Welcome to melange..." → 0.23
   Chunk 5:  "Hours: Mon-Fri..." → 0.31
   Chunk 12: "Side menu: Qibe Muffin $5..." → 0.89 ✅
   Chunk 23: "Qibe Drenched Biscuit..." → 0.85 ✅
   ...

7. Filter: Keep only >= 0.7 → 2 chunks remain

8. Sort by score: [0.89, 0.85]

9. Take top 5 (only 2 available)

10. Format context:
    ### Relevant Knowledge Base Context:
    
    [Source 1: menu.pdf - Side Menu]
    Side menu items:
    - Qibe Drenched Biscuit Muffin: $5.00
      Served with berbere butter and jam
    
    [Source 2: menu.pdf - Main Menu]
    Our signature items include the Qibe Drenched 
    Biscuit Muffin made fresh daily...

11. Return to n8n AI Agent

12. AI Agent combines:
    System Message + RAG Context + User Question → GPT-4

13. GPT-4 Response:
    "The price of the Qibe Drenched Biscuit Muffin from 
     the side menu is $5.00. It is served with berbere 
     butter and jam."

14. Send to user via Chatwoot ✅


┌─────────────────────────────────────────────────────────────────────────┐
│                         ADVANTAGES OF RAG                               │
└─────────────────────────────────────────────────────────────────────────┘

✅ **Dynamic Knowledge**
   - Upload new menu → Immediately searchable
   - No need to retrain AI

✅ **Accurate Answers**
   - AI uses actual documents
   - No hallucination (when RAG is used)

✅ **Source Attribution**
   - Shows which document has the answer
   - User can verify information

✅ **Semantic Search**
   - Understands meaning, not just keywords
   - "What's the cost?" matches "Price: $5"

✅ **Multi-Document Support**
   - Search across menus, policies, FAQs
   - Single query, all sources

✅ **Privacy**
   - Your documents stay in your database
   - Only relevant chunks sent to AI


┌─────────────────────────────────────────────────────────────────────────┐
│                         FILE LOCATIONS                                  │
└─────────────────────────────────────────────────────────────────────────┘

RAG API:
└─ app/api/rag/retrieve/route.ts

Document Processing:
├─ lib/knowledge-base/document-processor.ts (main orchestrator)
├─ lib/knowledge-base/chunking.ts (text splitting)
├─ lib/knowledge-base/pdf-extractor.ts (PDF → text)
└─ lib/knowledge-base/docx-extractor.ts (DOCX → text)

Workflow Assignment:
├─ app/api/dashboard/knowledge-bases/[id]/link-workflow/route.ts
├─ app/api/dashboard/knowledge-bases/[id]/workflow-links/route.ts
└─ lib/n8n-api-rag.ts (auto-update n8n workflow)

Database:
└─ prisma/schema.prisma
   ├─ KnowledgeBase model
   ├─ Document model
   ├─ DocumentChunk model
   └─ WorkflowKnowledgeBase model

Frontend:
└─ app/dashboard/knowledge-bases/[id]/page.tsx


┌─────────────────────────────────────────────────────────────────────────┐
│                         SUMMARY                                         │
└─────────────────────────────────────────────────────────────────────────┘

**RAG = Retrieval Augmented Generation**

Simple Explanation:
1. User uploads documents (PDF/DOCX)
2. System splits into chunks (~750 words each)
3. Each chunk → 1536 numbers (embedding)
4. User asks question via chatbot
5. Question → 1536 numbers (embedding)
6. Compare question to all chunks (cosine similarity)
7. Find most similar chunks (e.g., 0.89 similarity)
8. Send those chunks to AI
9. AI uses chunks to answer accurately
10. User gets precise answer with sources

**Result:** AI answers from YOUR documents, not from general knowledge!

