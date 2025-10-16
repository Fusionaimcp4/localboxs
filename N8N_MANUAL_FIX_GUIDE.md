# n8n RAG Tool Manual Fix Guide

## 🚨 **The Problem**

The RAG API is receiving the literal string `"={{ $json.chatInput }}"` instead of the actual user question. This means the n8n expression is NOT being evaluated.

**Evidence from logs:**
```
[RAG] Generating embedding for query: "={{ $json.chatInput }}..."
[RAG] Searching through 1 chunks for workflow cmgo8jef70003ifrk7qf5mwpn
[RAG] Found 0 relevant chunks
```

---

## 🔧 **Manual Fix Instructions**

### **Step 1: Open the Workflow in n8n**

1. Go to: https://n8n.sost.work/workflow/zCpmybq6jjvLYenU
2. Click on the **"Retrieve Knowledge Base Context"** node

---

### **Step 2: Check What Data the Tool Receives**

**Option A: Check Execution Data**
1. Send a test message in your chat widget
2. In n8n, click on **"Executions"** tab (top right)
3. Click on the latest execution
4. Click on the **"Retrieve Knowledge Base Context"** node
5. Look at the **"INPUT"** tab
6. **Note down EXACTLY what fields you see** - this is the data coming from the AI Agent

**Option B: Test Expression in Node**
1. In the "Retrieve Knowledge Base Context" node settings
2. Find the "Body" section
3. For the "query" parameter, click the **expression editor** icon (looks like `fx` or `=`)
4. Type: `{{ $input.first().json }}`
5. Click **"Execute node"** (if available) or run the workflow
6. See what data structure appears

---

### **Step 3: Fix the Query Parameter**

Based on what you find, the data might look like one of these:

**If you see:**
```json
{
  "query": "What is the price..."
}
```
→ Use: `{{ $json.query }}`

**If you see:**
```json
{
  "input": "What is the price..."
}
```
→ Use: `{{ $json.input }}`

**If you see:**
```json
{
  "text": "What is the price..."
}
```
→ Use: `{{ $json.text }}`

**If you see:**
```json
{
  "chatInput": "What is the price..."
}
```
→ Use: `{{ $json.chatInput }}`

---

### **Step 4: Update the HTTP Request Tool**

In the "Retrieve Knowledge Base Context" node:

1. **Body Type:** Make sure it's set to **"JSON"** or **"Form Data"/"Key-Value Pairs"**
2. **Body Parameters** (if using Key-Value):
   ```
   query: {{ $json.[FIELD_NAME_YOU_FOUND] }}  ← Use the correct field name
   workflowId: zCpmybq6jjvLYenU
   limit: 5
   similarityThreshold: 0.4
   ```

3. **OR if using JSON Body:**
   ```json
   {
     "query": "{{ $json.[FIELD_NAME] }}",
     "workflowId": "zCpmybq6jjvLYenU",
     "limit": 5,
     "similarityThreshold": 0.4
   }
   ```
   **Note:** For JSON body, you might need to NOT use the `={{  }}` syntax, just `{{ }}`

---

### **Step 5: Save and Test**

1. Click **"Save"** in n8n
2. Make sure the workflow is **ACTIVE** (toggle in top-right)
3. Send a test message in your chat widget
4. Check the n8n execution logs
5. Check your terminal for RAG API logs

**What to look for:**
- ✅ Good: `[RAG] Generating embedding for query: "What is the price..."`
- ❌ Bad: `[RAG] Generating embedding for query: "={{ $json.query }}..."`

---

## 🎯 **Alternative: Use AI Agent Tool Description**

If the above doesn't work, the httpRequestTool node might need a different configuration:

1. In the tool node, look for a **"Tool Description"** or **"Schema"** section
2. Define an input parameter:
   - **Name:** `query`
   - **Type:** `string`
   - **Description:** "The user's question to search for in the knowledge base"
3. Then in the Body, reference it as: `{{ $parameters.query }}` or just `query`

---

## 📸 **Send Me a Screenshot**

If you're stuck, send me a screenshot of:
1. The "Retrieve Knowledge Base Context" node settings (especially the Body section)
2. The INPUT data from an execution (showing what data the tool actually receives)

I can then tell you the exact expression to use!

---

## 🔍 **Quick Diagnostic**

Run this in your chat widget and watch both:
1. **n8n Execution** - to see what the tool receives
2. **Your terminal** - to see what the API receives

**Test question:** "What is the price of Qibe Drenched Biscuit Muffin?"

**Expected flow:**
1. User sends question
2. AI Agent calls "Retrieve Knowledge Base Context" tool
3. Tool sends actual question (not expression) to API
4. API finds matching content in PDF
5. AI uses context to answer

**Current problem:** Step 3 is sending the expression as a literal string

---

## 💡 **Why This Is Happening**

httpRequestTool nodes in n8n have special syntax for receiving input from AI Agents. The way I've been configuring it via API might not match how n8n's UI actually sets it up internally. That's why we need to fix it manually in the UI where n8n can properly configure the tool's input schema.

---

**Once you find the correct field name from the execution data, let me know and I'll update the auto-configuration script!**

