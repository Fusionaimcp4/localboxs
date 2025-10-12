# CRM Integration Setup Guide

## Overview

The LocalBoxs platform now supports **user-specific CRM integrations**, allowing each user to configure their own CRM credentials securely. Currently supported:

- ✅ **Chatwoot** (Full Support)
- 🚧 **Salesforce** (Coming Soon)
- 🚧 **HubSpot** (Coming Soon)
- 🚧 **Zoho CRM** (Coming Soon)
- 🚧 **Pipedrive** (Coming Soon)
- ✅ **Custom CRM** (API Configuration)

## Features

- 🔐 **Secure Credential Storage** - All API keys and sensitive data are encrypted using AES-256-GCM
- 👥 **Multi-User Support** - Each user can configure their own CRM credentials
- 🔄 **Backward Compatible** - Falls back to environment variables if no user CRM is configured
- ✅ **Connection Testing** - Test your CRM connection before saving
- 🎨 **Dynamic Forms** - Different CRM providers have custom configuration forms
- 🛠️ **Extensible** - Easy to add new CRM providers

## Initial Setup

### 1. Generate Encryption Key

First, generate a secure encryption key for storing credentials:

```bash
npm run generate-encryption-key
```

This will output a key like:
```
INTEGRATION_ENCRYPTION_KEY=a1b2c3d4e5f6...
```

### 2. Add to Environment Variables

Add the generated key to your `.env` file:

```bash
# Integration Credentials Encryption
INTEGRATION_ENCRYPTION_KEY=your-generated-key-here

# Optional: Global Chatwoot credentials (fallback for users without CRM config)
CHATWOOT_BASE_URL=https://chatwoot.mcp4.ai
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_API_KEY=your-api-key
```

⚠️ **IMPORTANT**: Keep this key secure and never commit it to version control!

### 3. Update Database Schema

Run Prisma migration to create the Integration table:

```bash
npx prisma migrate dev
```

The `Integration` model is already defined in `prisma/schema.prisma`.

## User Configuration

### Accessing CRM Settings

1. Log in to your dashboard
2. Navigate to **Dashboard → Integrations**
3. Click **Add Integration**
4. Select **CRM Integration**
5. Choose your CRM provider

### Configuring Chatwoot

#### Required Information:

- **Integration Name**: A friendly name (e.g., "Production Chatwoot")
- **Chatwoot Base URL**: Your Chatwoot instance URL
  - Cloud: `https://app.chatwoot.com`
  - Self-hosted: `https://your-chatwoot-domain.com`
- **Account ID**: Found in Chatwoot → Settings → Account
- **API Access Token**: Found in Chatwoot → Profile Settings → Access Token

#### Optional Features:

- ✅ Auto-create Inboxes (recommended)
- ✅ Auto-create Agent Bots (recommended)
- ✅ Sync Contacts (recommended)

#### Getting Your Chatwoot Credentials:

1. **Base URL**: Your Chatwoot installation URL
2. **Account ID**: 
   - Go to Chatwoot Dashboard
   - Click Settings → Account Settings
   - Copy the Account ID
3. **API Token**:
   - Go to Profile Settings (click your avatar)
   - Click "Access Token"
   - Copy or generate a new token

### Configuring Custom CRM

For CRMs not officially supported:

1. **CRM Name**: Your CRM name (e.g., "My Custom CRM")
2. **API Base URL**: Your CRM's API endpoint
3. **Authentication Type**: Choose from:
   - API Key
   - Bearer Token
   - Basic Auth
   - OAuth 2.0
4. **Credentials**: JSON object with authentication details

Example credentials JSON:
```json
{
  "api_key": "your-api-key-here",
  "username": "your-username",
  "password": "your-password"
}
```

## Testing Your Connection

After entering your credentials:

1. Click **Test Connection**
2. Wait for verification
3. ✅ Green message = Success
4. ❌ Red message = Check your credentials and try again

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│           User Dashboard                │
│   (CRM Configuration Interface)         │
└─────────────────┬───────────────────────┘
                  │
                  │ Save/Update
                  ▼
┌─────────────────────────────────────────┐
│        Integration Service              │
│  - Validates credentials                │
│  - Tests connection                     │
│  - Encrypts sensitive data (API keys)   │
└─────────────────┬───────────────────────┘
                  │
                  │ Encrypted data
                  ▼
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│  - Stores encrypted credentials         │
│  - Links to user account                │
└─────────────────┬───────────────────────┘
                  │
                  │ Retrieve when needed
                  ▼
┌─────────────────────────────────────────┐
│    Chatwoot/CRM Operations              │
│  - Create inboxes                       │
│  - Create agent bots                    │
│  - Sync contacts                        │
│  - Send messages                        │
└─────────────────────────────────────────┘
```

### Security

1. **Encryption**: All sensitive credentials (API keys, passwords, tokens) are encrypted using AES-256-GCM before storage
2. **User Isolation**: Each user can only access their own integrations
3. **Secure Transport**: All CRM API calls use HTTPS
4. **Key Management**: Encryption key is stored separately in environment variables

### Backward Compatibility

The system maintains backward compatibility with environment-based configuration:

```javascript
// Order of priority:
1. User's CRM Integration (if configured)
2. Environment Variables (fallback)
3. Error if neither is available
```

## API Usage

### Creating Integrations

```typescript
POST /api/dashboard/integrations/create
{
  "name": "My Chatwoot",
  "type": "CRM",
  "configuration": {
    "provider": "CHATWOOT",
    "baseUrl": "https://app.chatwoot.com",
    "accountId": "123",
    "apiKey": "your-api-key",
    "features": {
      "autoCreateInboxes": true,
      "autoCreateBots": true,
      "syncContacts": true
    }
  }
}
```

### Testing Connection

```typescript
POST /api/dashboard/integrations/test
{
  "type": "CRM",
  "configuration": {
    "provider": "CHATWOOT",
    "baseUrl": "https://app.chatwoot.com",
    "accountId": "123",
    "apiKey": "your-api-key"
  }
}
```

### Updating Integrations

```typescript
PUT /api/dashboard/integrations/{integrationId}
{
  "name": "Updated Name",
  "isActive": true
}
```

### Deleting Integrations

```typescript
DELETE /api/dashboard/integrations/{integrationId}
```

## Development

### Adding a New CRM Provider

1. **Update Types** (`lib/integrations/types.ts`):
```typescript
export interface NewCRMConfiguration extends BaseCRMConfiguration {
  provider: 'NEWCRM';
  apiKey: string;
  endpoint: string;
  // ... other fields
}
```

2. **Add Provider Info** (`lib/integrations/crm-providers.ts`):
```typescript
NEWCRM: {
  id: 'NEWCRM',
  name: 'New CRM',
  description: '...',
  icon: '🆕',
  features: { ... },
  requiresOAuth: false,
}
```

3. **Define Form Fields** (`lib/integrations/crm-providers.ts`):
```typescript
NEWCRM: [
  {
    name: 'apiKey',
    label: 'API Key',
    type: 'password',
    sensitive: true,
    validation: { required: true }
  },
  // ... more fields
]
```

4. **Implement Service** (`lib/integrations/crm-service.ts`):
```typescript
async function testNewCRMConnection(config: NewCRMConfiguration) {
  // Test connection logic
}
```

5. **Create Form Component** (`components/integrations/NewCRMConfigForm.tsx`):
```typescript
export function NewCRMConfigForm({ configuration, onChange }: Props) {
  // Form implementation
}
```

6. **Update Modal** (`components/integrations/CRMConfigModal.tsx`):
```typescript
{selectedProvider === 'NEWCRM' && (
  <NewCRMConfigForm ... />
)}
```

## Troubleshooting

### Connection Test Fails

**Issue**: "Failed to connect to Chatwoot"

**Solutions**:
1. Verify your Base URL is correct (include https://)
2. Check your Account ID
3. Ensure API token is valid (regenerate if needed)
4. Check network/firewall settings

### Encryption Errors

**Issue**: "INTEGRATION_ENCRYPTION_KEY environment variable is required"

**Solution**: Generate and add encryption key to `.env`

### Already Encrypted Errors

**Issue**: Credentials appear as encrypted strings in forms

**Solution**: This is normal behavior. The system detects encrypted data and handles it automatically.

### Missing Chatwoot Features

**Issue**: Bot creation fails with 404

**Solution**: 
- Your Chatwoot version might not support Agent Bots API
- Disable "Auto-create Agent Bots" in integration settings
- Upgrade to latest Chatwoot version

## Migration from Environment Variables

If you're currently using environment variables for Chatwoot:

1. **Nothing Changes**: System will continue using env vars until you configure user CRM
2. **Gradual Migration**: Users can configure their own CRM at their own pace
3. **Testing**: You can test user CRM alongside env vars
4. **Removal**: Once all users have configured CRM, you can remove env vars

## Best Practices

✅ **DO**:
- Test connection before saving
- Use descriptive integration names
- Keep API tokens secure
- Regularly rotate API keys
- Use separate CRM accounts for dev/prod

❌ **DON'T**:
- Share API tokens between users
- Commit credentials to git
- Use admin tokens (use dedicated tokens)
- Leave test integrations active in production

## Support

For issues or questions:
1. Check this guide first
2. Review CRM provider documentation
3. Check application logs for detailed errors
4. Contact support with error messages

## Future Enhancements

🔮 **Planned Features**:
- OAuth 2.0 authentication flow
- Webhook management interface
- CRM data sync scheduling
- Analytics dashboard
- Team-wide CRM sharing
- Multi-CRM support per user
- Automatic failover between CRMs

