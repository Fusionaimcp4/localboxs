# Production Deployment Guide - Helpdesk Setup Feature

This document outlines the deployment steps for the new Helpdesk Setup feature.

## Overview

The Helpdesk Setup feature allows LocalBoxs users to create and manage Chatwoot helpdesk agents directly from their dashboard, with tier-based limits on the number of agents they can create.

## Changes Made

### Database Schema
- Added `HelpdeskUser` model to store Chatwoot agent information
- Added `HelpdeskUserInbox` model to map agents to Chatwoot inboxes
- Added `maxHelpdeskAgents` field to `TierLimit` model for tier-based restrictions

### API Endpoints
- `POST /api/dashboard/integrations/chatwoot/create-user` - Creates a new helpdesk agent
- `GET /api/dashboard/integrations/chatwoot/agents` - Lists all helpdesk agents for the current user
- `GET /api/dashboard/integrations/chatwoot/inboxes` - Lists available Chatwoot inboxes (tenant-isolated)
- `POST /api/dashboard/integrations/chatwoot/assign-agent` - Assigns/removes agents from inboxes
- `GET /api/dashboard/tier-limits` - Fetches dynamic tier limits for the current user

### Environment Variables

Add this new environment variable to your production `.env`:

```bash
CHATWOOT_PLATFORM_API_KEY="your-chatwoot-platform-api-key"
```

This key is required for creating users in Chatwoot's platform-level API.

### Docker Configuration

The following environment variable has been added to `docker-compose.prod.yml`:

```yaml
CHATWOOT_PLATFORM_API_KEY: ${CHATWOOT_PLATFORM_API_KEY}
```

## Deployment Steps

### 1. Update Docker Compose

The `docker-compose.prod.yml` file has been updated to include the new environment variable. No additional changes needed.

### 2. Run Database Migration

On your production server, run the Prisma migration to add the new tables:

```bash
# SSH into your production server
ssh user@your-server.com

# Navigate to your application directory
cd /path/to/localboxs

# Run the migration
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate
```

### 3. Set Environment Variable

Add the `CHATWOOT_PLATFORM_API_KEY` to your production `.env` file:

```bash
CHATWOOT_PLATFORM_API_KEY="your-actual-platform-api-key"
```

**How to get the Platform API Key:**

1. Log into your Chatwoot admin panel
2. Go to **Settings** > **Applications** > **Platform API**
3. Create a new platform API token or use the existing one
4. Copy the token and add it to your `.env` file

### 4. Rebuild and Restart Docker Containers

```bash
# Stop existing containers (this preserves your data due to volume mounts)
docker-compose -f docker-compose.prod.yml down

# Rebuild the application
docker-compose -f docker-compose.prod.yml build --no-cache

# Start the containers
docker-compose -f docker-compose.prod.yml up -d

# Check logs to ensure everything started correctly
docker-compose -f docker-compose.prod.yml logs -f app
```

**Important:** The `docker-compose.prod.yml` file now includes volume mounts for `public/demos`, `public/knowledge-bases`, and `public/system_messages`. This means your demo content, uploaded knowledge bases, and system messages will persist across container rebuilds.

### 5. Verify Deployment

1. **Check API Health:**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Test Helpdesk Setup:**
   - Log into the LocalBoxs dashboard
   - Navigate to **Integrations** > **Helpdesk Setup**
   - Try creating a helpdesk agent
   - Verify that agents appear in Chatwoot

3. **Check Prisma Studio (Optional):**
   ```bash
   npx prisma studio
   ```
   - Navigate to the `helpdesk_users` table to verify agents are being saved

## Tier Limits

The following tier limits have been configured for helpdesk agents:

- **FREE**: 1 agent
- **PRO**: 3 agents
- **PRO_PLUS**: 5 agents
- **ENTERPRISE**: Unlimited (-1)

These limits are stored in the `tier_limits` table and can be adjusted by admins via the Admin Dashboard > Tier Limits.

## Troubleshooting

### Issue: "Invalid access_token" error when creating agents

**Solution:** Ensure `CHATWOOT_PLATFORM_API_KEY` is set correctly in your production `.env` file.

### Issue: Agents are created but not showing in Chatwoot inbox

**Solution:** This happens when the second step (adding agent to account) fails. Check the terminal logs for the specific error. The agent is created in Chatwoot but may need to be added manually via the Chatwoot UI.

### Issue: "Cannot read properties of undefined (reading 'findMany')" error

**Solution:** Run `npx prisma generate` on the production server to regenerate the Prisma client with the new models.

### Issue: "Foreign key constraint violated" error

**Solution:** This means the user ID in the session doesn't exist in the database. Ensure users are properly migrated from your local database to production.

## Important Notes

1. **Persistent Storage:** Demo content, knowledge bases, and system messages are now persisted via Docker volume mounts. These directories (`public/demos`, `public/knowledge-bases`, `public/system_messages`) will survive container rebuilds.

2. **Tenant Isolation:** Inbox listings are tenant-isolated. Users only see inboxes associated with their demos.

3. **Plus-Addressing:** Agent emails are automatically generated using plus-addressing (e.g., `user@domain.com` → `user+agentname@domain.com`). This allows multiple agents from one email address.

4. **Password Requirements:** Agent passwords must meet Chatwoot's requirements:
   - Minimum 8 characters
   - At least 1 number
   - At least 1 special character

5. **API Error Handling:** If the Chatwoot API fails at any step, the error is logged and returned to the user with helpful messages.

## Support

For issues or questions about this deployment, please contact the development team.

