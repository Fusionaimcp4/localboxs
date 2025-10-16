# 🤖 Automatic n8n RAG Configuration

## ✅ What We Built

Automatic n8n workflow configuration when linking Knowledge Bases! The system now updates the "Retrieve Knowledge Base Context" node in n8n automatically, just like we update system messages.

---

## 🎯 Features

### **Automatic Updates When:**
1. **Linking KB to Workflow** → Updates n8n RAG tool settings
2. **Updating Link Settings** → Updates n8n RAG tool threshold/limit

### **What Gets Updated:**
- `workflowId`: Set to n8nWorkflowId
- `similarityThreshold`: Your configured threshold (default 0.4)
- `retrievalLimit`: Max chunks to return (default 5)
- `url`: Keeps existing ngrok/localhost URL
- HTTP headers and body configuration

---

## 📁 Files Created/Modified

### **New File:**
```
lib/n8n-api-rag.ts
```
**Purpose:** Contains `updateN8nWorkflowRAGSettings()` function
**Function:** Updates the "Retrieve Knowledge Base Context" node in n8n

### **Modified Files:**
```
app/api/dashboard/knowledge-bases/[id]/link-workflow/route.ts
  └─ Added: Auto-update n8n when linking KB

app/api/dashboard/knowledge-bases/[id]/workflow-links/route.ts
  └─ Added: Auto-update n8n when updating link settings

app/api/dashboard/knowledge-bases/[id]/unlink-workflow/route.ts
  └─ Fixed: Next.js 15 async params

app/api/dashboard/knowledge-bases/[id]/workflow-links/route.ts
  └─ Fixed: Next.js 15 async params
```

---

## 🔄 How It Works

### **1. User Links KB to Workflow in Dashboard**

```
User clicks "Link Workflow" → Selects workflow → Sets:
  - Priority: 1
  - Limit: 5
  - Threshold: 0.4
→ Clicks "Link Workflow"
```

### **2. Backend Creates Link**

```typescript
// Create database link
const link = await prisma.workflowKnowledgeBase.create({
  workflowId,
  knowledgeBaseId,
  priority: 1,
  retrievalLimit: 5,
  similarityThreshold: 0.4,
  isActive: true
});
```

### **3. Backend Automatically Updates n8n**

```typescript
// Update n8n workflow
if (workflow.n8nWorkflowId) {
  await updateN8nWorkflowRAGSettings(workflow.n8nWorkflowId, {
    retrievalLimit: 5,
    similarityThreshold: 0.4
  });
}
```

### **4. n8n Node Gets Updated**

```json
{
  "query": "={{ $json.user_messages }}",
  "workflowId": "zCpmybq6jjvLYenU",
  "limit": 5,
  "similarityThreshold": 0.4
}
```

---

## 🎨 What Gets Updated in n8n

### **Before (Manual):**
User had to:
1. Open n8n workflow manually
2. Find "Retrieve Knowledge Base Context" node
3. Click and edit the node
4. Change threshold from 0.7 to 0.4
5. Change workflowId
6. Save the workflow

### **After (Automatic):**
System does it all automatically! User just:
1. Links KB in dashboard
2. System updates n8n
3. Done! ✅

---

## 🔧 Technical Details

### **Function: `updateN8nWorkflowRAGSettings()`**

**Location:** `lib/n8n-api-rag.ts`

**Parameters:**
```typescript
{
  workflowId: string,              // n8n workflow ID (e.g., "zCpmybq6jjvLYenU")
  ragSettings: {
    retrievalLimit: number,         // Max chunks (1-20)
    similarityThreshold: number,    // Threshold (0.0-1.0)
    ragApiUrl?: string             // Optional: keep existing or set new
  }
}
```

**Process:**
1. Fetch workflow from n8n API
2. Find "Retrieve Knowledge Base Context" node (type: `n8n-nodes-base.httpRequestTool`)
3. Update node parameters:
   - `url`: RAG API endpoint
   - `jsonBody`: Updated with workflowId, limit, threshold
   - `method`: POST
   - `headers`: Content-Type: application/json
4. Send updated workflow back to n8n

**Error Handling:**
- Non-critical: If n8n update fails, link still created
- Logs warning but doesn't fail the operation
- User can manually update if needed

---

## 📊 Update Triggers

### **1. Create Link (POST)**
```
POST /api/dashboard/knowledge-bases/[id]/link-workflow
Body: {
  workflowId, priority, retrievalLimit, similarityThreshold
}
→ Creates link + Updates n8n ✅
```

### **2. Update Link Settings (PUT)**
```
PUT /api/dashboard/knowledge-bases/[id]/workflow-links
Body: {
  linkId, retrievalLimit, similarityThreshold
}
→ Updates link + Updates n8n ✅
```

### **3. Toggle Active/Inactive**
```
PUT /api/dashboard/knowledge-bases/[id]/workflow-links
Body: {
  linkId, isActive: false
}
→ Updates link only (no n8n update needed)
```

---

## 🧪 Testing

### **Test 1: Link KB to Workflow**

1. Go to: `/dashboard/knowledge-bases/[kb-id]`
2. Click "+ Link Workflow"
3. Select "melangefoods.com"
4. Set:
   - Priority: 1
   - Limit: 5
   - Threshold: 0.4
5. Click "Link Workflow"
6. Check terminal logs for:
   ```
   🔄 Updating n8n workflow zCpmybq6jjvLYenU RAG settings...
   🔍 Available nodes in workflow:
     ...
     19. Name: "Retrieve Knowledge Base Context", Type: "n8n-nodes-base.httpRequestTool"
   ✅ Found RAG node: "Retrieve Knowledge Base Context"
   ✅ Updating RAG node with: { threshold: 0.4, limit: 5, ... }
   🔄 Sending updated workflow to n8n...
   ✅ n8n API request successful
   ✅ n8n workflow RAG settings updated successfully
   ```

### **Test 2: Update Link Settings**

1. In the linked workflows section
2. Click "Active" button to toggle
3. Or use the settings to change threshold
4. Check terminal for n8n update logs

### **Test 3: Verify in n8n**

1. Open: https://n8n.sost.work/workflow/zCpmybq6jjvLYenU
2. Click "Retrieve Knowledge Base Context" node
3. Check JSON Body:
   ```json
   {
     "query": "{{ $json.userMessage }}",
     "workflowId": "zCpmybq6jjvLYenU",
     "limit": 5,
     "similarityThreshold": 0.4
   }
   ```
4. Should match your dashboard settings! ✅

---

## 🎯 Benefits

### **Before (Manual Process):**
- ❌ Had to remember to update n8n
- ❌ Easy to forget or make mistakes
- ❌ Threshold mismatch (0.7 in n8n, 0.4 in DB)
- ❌ Wrong workflowId in n8n
- ❌ Time-consuming manual updates

### **After (Automatic):**
- ✅ Always synchronized
- ✅ No manual steps
- ✅ Guaranteed consistency
- ✅ Correct workflowId always
- ✅ Instant updates

---

## 🔐 Security & Error Handling

### **Security:**
- ✅ User authentication required
- ✅ Ownership validation (can only link own KBs to own workflows)
- ✅ n8n API key secured in environment variable
- ✅ Retry logic with exponential backoff

### **Error Handling:**
- ✅ Non-critical failures (link still created)
- ✅ Detailed logging for debugging
- ✅ Graceful degradation
- ✅ Clear error messages

### **Logging:**
```
🔄 Starting operation
🔍 Finding nodes
✅ Success messages
⚠️  Warnings
❌ Errors (with details)
💡 Helpful hints
```

---

## 📝 Environment Variables Required

```env
N8N_BASE_URL=https://n8n.sost.work
N8N_API_KEY=your_api_key_here
```

Already set in your `.env` file! ✅

---

## 🚀 What's Next

### **Current State:**
- ✅ Auto-update when linking KB
- ✅ Auto-update when changing settings
- ✅ Preserves existing ngrok URL
- ✅ Handles errors gracefully

### **Future Enhancements:**
- [ ] Auto-update RAG URL when ngrok restarts
- [ ] Webhook to notify n8n of KB updates
- [ ] Real-time sync indicator in UI
- [ ] Bulk update all workflows
- [ ] Rollback on failure option

---

## 💡 Pro Tips

1. **ngrok URL:** The system preserves the existing URL in the node. Update it once, and it stays.

2. **Testing:** Always check terminal logs to see if n8n update succeeded.

3. **Manual Fallback:** If auto-update fails, you'll see a warning log. Update manually in n8n if needed.

4. **n8n Node Name:** Must be exactly "Retrieve Knowledge Base Context" or contain "Knowledge Base" in the name.

5. **Debugging:** If updates aren't working, check:
   - N8N_API_KEY is set
   - n8nWorkflowId exists in database
   - Node name matches in n8n
   - n8n API is accessible

---

## 🎊 Summary

**Before:** Manual, error-prone, time-consuming
**After:** Automatic, reliable, instant ✨

When you link a Knowledge Base to a workflow in the dashboard, the system now:
1. Creates the database link ✅
2. Updates the n8n workflow automatically ✅
3. Sets the correct threshold and workflowId ✅
4. Logs everything for debugging ✅

**No more manual n8n updates! Everything is synchronized!** 🚀

---

**Test it now by linking/unlinking a KB in the dashboard and checking the terminal logs!**

