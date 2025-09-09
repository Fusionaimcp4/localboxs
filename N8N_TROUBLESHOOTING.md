# n8n API Integration Troubleshooting Guide

## Issue: n8n GET /rest/workflows/ID 401 Unauthorized

You're seeing this error because the n8n API authentication is failing. Here's how to fix it:

## 🔍 Diagnosis Steps

### 1. Run the API Test Script

```bash
npx ts-node scripts/test-n8n-api.ts
```

This will check your configuration and test the API connection.

### 2. Check Your Environment Variables

Make sure these are set in your `.env` file:

```bash
N8N_BASE_URL=https://n8n.sost.work
N8N_API_KEY=your_actual_api_key_here
MAIN_WORKFLOW_ID=your_workflow_id_here
```

## 🔧 Common Solutions

### Solution 1: Generate/Verify API Key

1. **Access n8n Admin Interface**:
   - Go to `https://n8n.sost.work`
   - Log in as admin

2. **Generate API Key**:
   - Go to **Settings** → **API**
   - Click **Create API Key** or **Regenerate**
   - Copy the generated key

3. **Update .env file**:
   ```bash
   N8N_API_KEY=n8n_api_1234567890abcdef...
   ```

### Solution 2: Find Correct Workflow ID

1. **List All Workflows**:
   ```bash
   curl -H "X-N8N-API-KEY: your_api_key" https://n8n.sost.work/rest/workflows
   ```

2. **Find Your Main Workflow**:
   - Look for the workflow you want to clone
   - Copy its `id` field

3. **Update .env file**:
   ```bash
   MAIN_WORKFLOW_ID=actual_workflow_id_here
   ```

### Solution 3: Check n8n API Settings

1. **Enable API Access**:
   - In n8n Settings → **Security**
   - Make sure **API** is enabled
   - Check if there are IP restrictions

2. **Verify Permissions**:
   - The API key should have workflow read/write permissions
   - Check if your user account has admin privileges

### Solution 4: Network/URL Issues

1. **Verify Base URL**:
   - Test: `curl https://n8n.sost.work/rest/workflows`
   - Should return JSON, not HTML

2. **Check HTTPS/HTTP**:
   - Make sure you're using the correct protocol
   - Some n8n installations use HTTP on custom ports

## 🧪 Manual Testing

### Test API Key Manually

```bash
# Replace with your actual values
export N8N_BASE_URL="https://n8n.sost.work"
export N8N_API_KEY="your_api_key_here"

# Test basic connection
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/rest/workflows"

# Test specific workflow
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/rest/workflows/your_workflow_id"
```

### Expected Responses

**Success (200)**:
```json
{
  "data": [
    {
      "id": "rAZR5mz9pxk84SYI",
      "name": "Main Workflow",
      "active": true,
      "nodes": [...]
    }
  ]
}
```

**Auth Error (401)**:
```json
{
  "code": 401,
  "message": "Unauthorized"
}
```

**Not Found (404)**:
```json
{
  "code": 404,
  "message": "Workflow not found"
}
```

## 🔄 After Fixing

1. **Update your .env file** with correct values
2. **Restart your Next.js server**: `npm run dev`
3. **Test the onboarding API** again
4. **Check the logs** for successful n8n workflow creation

## 📞 Still Having Issues?

If the problem persists:

1. **Check n8n Server Logs**: Look for authentication or API errors
2. **Verify n8n Version**: Some older versions have different API endpoints
3. **Test with Postman**: Use a REST client to isolate the issue
4. **Check Firewall**: Ensure the API port is accessible

The system will continue to work without n8n integration - you'll just need to manually clone and configure workflows until the API connection is fixed.
