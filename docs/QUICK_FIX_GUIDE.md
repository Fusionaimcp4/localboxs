# 🔧 Quick Fix Guide - PDF Processing Error

## Issue Summary

You're seeing:
1. ❌ Continuous GET API calls in logs
2. ❌ Console error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
3. ❌ Unable to load/process PDF files

## Root Cause

The **OpenAI API key is missing** from your `.env` file, causing document processing to fail.

---

## ✅ Fix (2 Steps)

### **Step 1: Add OpenAI API Key**

1. **Get your API key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-proj-...`)

2. **Add to `.env` file:**
   ```bash
   # Open .env file and add:
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

### **Step 2: Restart Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ What I Fixed in the Code

### **1. Fixed PDF/DOCX Import Issues**
- Changed to dynamic imports (prevents edge runtime errors)
- Better error handling for missing libraries

### **2. Fixed Continuous Polling**
- Auto-refresh now stops when no documents are processing
- Better error handling for API responses
- Checks for JSON content type before parsing

### **3. Added OpenAI Key Validation**
- Shows clear error if key is missing
- Prevents processing from starting without key

---

## 🧪 Test After Fix

1. **Restart server**: `npm run dev`
2. **Upload a PDF file**
3. **Check processing**:
   - Status should go: PENDING → PROCESSING → COMPLETED
   - No more console errors
   - Auto-refresh stops after processing

---

## 🐛 If Still Not Working

### **Check OpenAI API Key:**
```bash
# In terminal, check if key is loaded:
echo $OPENAI_API_KEY  # Linux/Mac
$env:OPENAI_API_KEY   # Windows PowerShell
```

### **Check Server Logs:**
Look for:
```
[Processor] Starting processing for document cmg...
[Processor] Extracting text from pdf file
[Processor] Chunking text (XXX words)
[Processor] Generating embeddings...
[Processor] Processed chunk 1/XX
```

### **If You See "OPENAI_API_KEY not configured":**
- Key is missing or not loaded
- Make sure it's in `.env` file (not `.env.example`)
- Restart server after adding

### **If You See Other Errors:**
Check the specific error message:
- **"Failed to extract text from PDF"** → PDF might be corrupted or image-based
- **"No text extracted"** → PDF is empty or image-only (needs OCR)
- **OpenAI API error** → Check API key is valid, has credits

---

## 💰 OpenAI Cost (Don't Worry!)

**Very cheap:**
- ~$0.0001 per 1K tokens
- Average document: ~$0.0005 (half a cent)
- 1000 documents: ~$0.50

**Free tier:** $5 in free credits when you sign up!

---

## 📊 Expected Behavior After Fix

### **Upload Flow:**
```
1. Drag & drop PDF
   ↓
2. Status: PENDING (instant)
   ↓
3. Status: PROCESSING (~10-30 seconds)
   ↓ 
   • Extracting text from PDF...
   • Chunking text into pieces...
   • Generating embeddings (OpenAI API)...
   ↓
4. Status: COMPLETED ✅
   
Stats updated:
• X chunks created
• X tokens processed
• Ready for search!
```

### **Auto-Refresh:**
- **While PENDING/PROCESSING**: Polls every 3 seconds
- **After COMPLETED**: Stops polling ✅
- **No more infinite loops!**

---

## ✨ Improvements Made

1. **Dynamic Imports**: PDF/DOCX libraries load on-demand
2. **Better Error Handling**: Clear error messages
3. **OpenAI Validation**: Checks key before processing
4. **Smart Polling**: Stops when no active processing
5. **JSON Validation**: Checks response type before parsing

---

## 🎯 Quick Checklist

- [ ] Add `OPENAI_API_KEY=sk-proj-...` to `.env`
- [ ] Restart server (`npm run dev`)
- [ ] Try uploading a PDF
- [ ] Verify status goes PENDING → PROCESSING → COMPLETED
- [ ] Check no console errors
- [ ] Verify auto-refresh stops after processing

---

## 🚀 You're Ready!

After adding the OpenAI API key and restarting, everything should work perfectly!

**Try it now:**
1. Add API key to `.env`
2. Restart: `npm run dev`
3. Upload a PDF
4. Watch the magic happen! ✨

---

## 💬 Still Having Issues?

**Check the logs for specific error messages:**
- Server logs: Terminal where `npm run dev` is running
- Browser console: F12 → Console tab
- Document error: Shows in red box on the document card

**Common issues:**
- ❌ Forgot to restart after adding key
- ❌ Key in wrong file (`.env.example` instead of `.env`)
- ❌ Key has typo or missing characters
- ❌ OpenAI account has no credits

**Need help?** Share the specific error message from the logs!

