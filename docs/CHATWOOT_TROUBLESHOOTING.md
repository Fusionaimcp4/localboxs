# Chatwoot Widget Troubleshooting Guide

## Issue: Chat Icon Not Showing on Demo Pages

### Quick Fix Applied ✅
I've updated the Chatwoot widget script with the following improvements:

1. **CORS Support**: Added `crossOrigin="anonymous"` to handle cross-origin requests
2. **Error Handling**: Added try-catch blocks and error logging
3. **Fallback Loading**: Added fallback script loading if the first attempt fails
4. **Console Logging**: Added detailed console messages for debugging
5. **Explicit Configuration**: Added explicit widget configuration options

### Test the Fix
1. Open: http://localhost:3000/demo/formspree-io-517867f7
2. Open browser dev tools (F12)
3. Check Console tab for messages:
   - ✅ "Chatwoot widget loaded successfully" = Working
   - ❌ Any error messages = Need further troubleshooting

### Common Issues & Solutions

#### 1. CORS (Cross-Origin Resource Sharing) Issues
**Problem**: Browser blocks requests to Chatwoot due to CORS policy
**Solution**: 
- Check Chatwoot admin panel → Settings → Integrations → Website Widget
- Add `http://localhost:3000` to allowed domains
- Or configure CORS headers on your Chatwoot instance

#### 2. Website Token Issues
**Problem**: Invalid or inactive website token
**Solution**:
- Verify token in Chatwoot admin panel
- Check if the inbox is active
- Regenerate token if needed

#### 3. Self-Hosted Chatwoot Configuration
**Problem**: Self-hosted instance not properly configured
**Solution**:
- Ensure Chatwoot instance is running
- Check if `/packs/js/sdk.js` is accessible
- Verify SSL certificate if using HTTPS

#### 4. Network/Firewall Issues
**Problem**: Network blocks requests to Chatwoot
**Solution**:
- Check firewall settings
- Verify DNS resolution
- Test direct access to Chatwoot URL

### Debugging Steps

#### Step 1: Check Browser Console
```javascript
// Open browser dev tools (F12) and check Console tab
// Look for these messages:
"Chatwoot widget loaded successfully" // ✅ Working
"Chatwoot widget failed to load: [error]" // ❌ Error
"Failed to load Chatwoot SDK: [error]" // ❌ SDK Error
```

#### Step 2: Check Network Tab
1. Open Network tab in dev tools
2. Refresh the demo page
3. Look for requests to:
   - `https://chatwoot.mcp4.ai/packs/js/sdk.js`
   - Any failed requests (red status)

#### Step 3: Test Chatwoot Directly
```bash
# Test if Chatwoot SDK is accessible
curl -I https://chatwoot.mcp4.ai/packs/js/sdk.js

# Should return: HTTP/1.1 200 OK
```

#### Step 4: Check Website Token
```bash
# Test website token endpoint
curl -I https://chatwoot.mcp4.ai/api/v1/widget/website_token/4zDnxdxE8h69RfvVXtZ4zF2E

# Should return: HTTP/1.1 200 OK (or 404 if token validation is disabled)
```

### Manual Testing

#### Test 1: Basic Widget Loading
```html
<!-- Add this to any HTML page to test Chatwoot -->
<script>
(function(d,t) {
  var BASE_URL="https://chatwoot.mcp4.ai";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js"; 
  g.crossOrigin="anonymous";
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({ 
      websiteToken: "4zDnxdxE8h69RfvVXtZ4zF2E", 
      baseUrl: BASE_URL 
    });
    console.log('Test: Chatwoot loaded');
  };
})(document,"script");
</script>
```

#### Test 2: Check Widget Object
```javascript
// In browser console, check if widget objects exist:
console.log('chatwootSDK:', window.chatwootSDK);
console.log('$chatwoot:', window.$chatwoot);
console.log('chatwoot:', window.chatwoot);
```

### Chatwoot Admin Panel Checks

1. **Go to**: https://chatwoot.mcp4.ai/app/accounts/2/settings/integrations
2. **Check**: Website Widget section
3. **Verify**:
   - Website token is active
   - Allowed domains include your domain
   - Widget is enabled

### Environment Variables Check

```bash
# Check your .env file
CHATWOOT_BASE_URL=https://chatwoot.mcp4.ai
CHATWOOT_ACCOUNT_ID=2
CHATWOOT_API_KEY=BVraYynQoVMRWRsuwsimnucg
```

### Alternative Solutions

#### Option 1: Use Different Loading Method
```html
<!-- Alternative script loading -->
<script src="https://chatwoot.mcp4.ai/packs/js/sdk.js" crossorigin="anonymous"></script>
<script>
  window.chatwootSDK.run({
    websiteToken: '4zDnxdxE8h69RfvVXtZ4zF2E',
    baseUrl: 'https://chatwoot.mcp4.ai'
  });
</script>
```

#### Option 2: Load After Page Load
```html
<script>
window.addEventListener('load', function() {
  // Load Chatwoot after page is fully loaded
  setTimeout(function() {
    // Your Chatwoot loading code here
  }, 1000);
});
</script>
```

### Contact Information
If issues persist:
1. Check Chatwoot documentation: https://www.chatwoot.com/docs
2. Verify self-hosted instance configuration
3. Check Chatwoot logs for errors
4. Test with a fresh website token

### Success Indicators
✅ Chat bubble appears in bottom-right corner
✅ Console shows "Chatwoot widget loaded successfully"
✅ No errors in browser console
✅ Network requests to Chatwoot return 200 OK
