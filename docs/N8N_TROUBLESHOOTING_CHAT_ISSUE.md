# 🔧 n8n Chat Not Using Knowledge Base - Troubleshooting Guide

## ✅ Backend Status: ALL WORKING
- Knowledge Base: Active ✅
- Document: Processed (1 chunk, 552 tokens) ✅
- Embeddings: Generated ✅
- Workflow Link: Active (threshold 0.4) ✅
- RAG API: Working ✅

## ❌ Issue: AI Not Using Retrieved Context

The problem is in your n8n workflow configuration. Follow these steps:

---

## 🎯 Fix Step 1: Update RAG Tool URL

### **Current ngrok:**
```
https://ac691440db0c.ngrok-free.app
```

### **Check if ngrok changed:**
1. In your terminal where ngrok is running, check the current URL
2. If it changed, update it in n8n

### **Update in n8n:**
1. Open: https://n8n.sost.work/workflow/zCpmybq6jjvLYenU
2. Click "Retrieve Knowledge Base Context" node
3. Update URL to your current ngrok URL:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/api/rag/retrieve
   ```
4. **Save the workflow!**

---

## 🎯 Fix Step 2: Update Threshold to 0.4

In the **same node** ("Retrieve Knowledge Base Context"):

### **Current (WRONG):**
```json
{
  "query": "{{ $json.userMessage }}",
  "workflowId": "zCpmybq6jjvLYenU",
  "limit": 5,
  "similarityThreshold": 0.7  ❌ TOO HIGH
}
```

### **Update to:**
```json
{
  "query": "{{ $json.userMessage }}",
  "workflowId": "zCpmybq6jjvLYenU",
  "limit": 5,
  "similarityThreshold": 0.4  ✅ CORRECT
}
```

**Click "Save"!**

---

## 🎯 Fix Step 3: Verify Tool Connection

### **Check:**
1. The "Retrieve Knowledge Base Context" node should have a **blue line** connecting to "AI Agent"
2. The connection type should be **"ai_tool"** (not "main")

### **If not connected:**
1. Click and drag from the **bottom circle** of "Retrieve Knowledge Base Context"
2. Drop it on the **AI Agent** node
3. Select **"ai_tool"** connection type

---

## 🎯 Fix Step 4: Update System Message (Critical!)

Your AI Agent system message needs to **explicitly tell the AI to use the RAG tool**.

### **Add this to your system message:**

```markdown
## Important Instructions

When a user asks a question about our menu, hours, services, or business:
1. ALWAYS use the "Retrieve Knowledge Base Context" tool first
2. The tool will provide you with accurate, up-to-date information
3. Base your answer on the retrieved context
4. If no context is retrieved, politely say you don't have that information

Do not make up information. Use the knowledge base tool for accuracy.
```

### **Where to add it:**
1. Click on "AI Agent" node
2. Find "System Message" field (in "Options" section)
3. Add the above text **at the top** of your system message
4. **Save!**

---

## 🎯 Fix Step 5: Test the Tool Directly in n8n

### **Before testing in Chatwoot:**
1. Click on "Retrieve Knowledge Base Context" node
2. Click "Test" or "Execute Node"
3. Use this test data:
   ```json
   {
     "userMessage": "What is on the menu?"
   }
   ```
4. You should see: **1 chunk returned** with menu content
5. If you see 0 chunks, the URL or threshold is wrong

---

## 🎯 Fix Step 6: Test in Chatwoot

### **Now test the chat:**
1. Open your Chatwoot widget
2. Ask: **"What's on the menu?"**
3. Check n8n execution logs (click workflow → Executions)
4. Look for:
   - ✅ "Retrieve Knowledge Base Context" was called
   - ✅ It returned data
   - ✅ AI Agent received the context
   - ✅ AI used it in the response

---

## 📊 Common Issues & Fixes

### **Issue 1: AI says "I don't know" even though RAG returned data**
**Fix:** Update system message to explicitly instruct AI to use retrieved context (Step 4)

### **Issue 2: RAG tool returns 0 chunks**
**Fixes:**
- Threshold too high → Set to 0.4
- ngrok URL wrong → Update URL
- Wrong workflowId → Verify it's `zCpmybq6jjvLYenU`

### **Issue 3: RAG tool not called at all**
**Fixes:**
- Tool not connected → Check connection (Step 3)
- System message missing instruction → Add instruction (Step 4)
- Tool node not configured → Verify it's type "httpRequestTool"

### **Issue 4: "Request failed" errors**
**Fixes:**
- ngrok expired → Restart ngrok, update URL
- Local server not running → Check `npm run dev` is running
- Firewall blocking → Check ngrok dashboard for requests

---

## 🔍 Debug Checklist

Run through this checklist:

```
[ ] ✅ Backend: All systems operational (per diagnostic)
[ ] ngrok is running on port 3000
[ ] ngrok URL is correct in n8n workflow
[ ] Threshold is 0.4 (not 0.7)
[ ] RAG tool node is connected to AI Agent (ai_tool)
[ ] System message instructs AI to use the tool
[ ] Workflow is saved and active
[ ] Test execution shows tool being called
[ ] Test execution shows chunks returned
[ ] Chatwoot test shows correct answer
```

---

## 🎯 Expected Result

When you ask **"What's on the menu?"** in Chatwoot:

### **n8n Execution Log should show:**
1. Webhook received ✅
2. "Retrieve Knowledge Base Context" called ✅
3. Returned 1 chunk with menu content ✅
4. AI Agent received context ✅
5. AI generated response using menu details ✅

### **Chatwoot Response should be:**
> "Our menu features delicious Ethiopian fusion cuisine! Here are our Mains:
> - Fried Doro Plate (2 pc.) - $11.00
> - Chicken Breast Sandwich - $12.00
> - Alicha Char-Grilled Doro Plate - $15-$24
> [... full menu with accurate prices ...]"

---

## 🚀 Quick Test Commands

### **Test RAG API directly:**
```bash
curl -X POST http://localhost:3000/api/rag/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is on the menu?",
    "workflowId": "zCpmybq6jjvLYenU",
    "limit": 5,
    "similarityThreshold": 0.4
  }'
```

**Expected:** JSON with menu content and similarity ~0.43

### **Test via ngrok:**
```bash
curl -X POST https://ac691440db0c.ngrok-free.app/api/rag/retrieve \
  -H "Content-Type": application/json" \
  -d '{
    "query": "What is on the menu?",
    "workflowId": "zCpmybq6jjvLYenU",
    "limit": 5,
    "similarityThreshold": 0.4
  }'
```

**Expected:** Same result as above

---

## 💡 Pro Tips

1. **Always check n8n execution logs** - They show exactly what happened
2. **Test the RAG tool node separately** - Before testing full workflow
3. **Update ngrok URL frequently** - Free ngrok URLs expire
4. **System message is crucial** - AI needs clear instructions to use tools
5. **Threshold 0.4-0.5 works best** - 0.7+ is too strict for most use cases

---

## 📞 Still Not Working?

Share:
1. Screenshot of n8n execution log
2. Screenshot of "Retrieve Knowledge Base Context" node settings
3. Screenshot of AI Agent system message
4. The exact error message from Chatwoot/n8n

---

**After following these steps, your AI should correctly use the knowledge base! 🎉**

