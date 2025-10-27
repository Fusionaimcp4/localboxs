# Server Setup Checklist - Helpdesk Setup Feature

## ✅ Steps to Verify on Server

### 1. Check if Database Migration Ran

SSH into your server and run:

```bash
# Check migration status
npx prisma migrate status

# If migrations are pending, run:
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```

### 2. Verify Environment Variables

Check that `CHATWOOT_PLATFORM_API_KEY` is set in your `.env` file:

```bash
grep CHATWOOT_PLATFORM_API_KEY .env
```

If missing, add it:

```bash
CHATWOOT_PLATFORM_API_KEY="your-platform-api-key-here"
```

### 3. Restart Docker Containers

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Start containers (rebuilding will happen automatically if needed)
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 4. Verify Helpdesk Setup is Visible

1. Log into the LocalBoxs dashboard
2. Navigate to **Integrations** page
3. Look for the **"Helpdesk Setup"** tile with a headphones icon
4. Click on it to open the Helpdesk Setup modal

### 5. Check Browser Console

Open browser DevTools (F12) and check for:
- Errors in the Console tab
- Network requests to `/api/dashboard/integrations/chatwoot/*` endpoints

### 6. Check Docker Container Logs

```bash
# View app logs
docker-compose -f docker-compose.prod.yml logs app

# Check for errors related to:
# - Prisma client
# - Missing environment variables
# - API endpoint failures
```

## Troubleshooting

### Issue: "Helpdesk Setup tile not visible"
**Solution:** 
- Check if the build was successful
- Verify that `components/integrations/HelpdeskModal.tsx` was created
- Restart the app container

### Issue: "Cannot read properties of undefined"
**Solution:** Run `npx prisma generate` to regenerate Prisma client

### Issue: "CHATWOOT_PLATFORM_API_KEY is required"
**Solution:** Add the environment variable to your `.env` file and restart containers

### Issue: "404 errors on API endpoints"
**Solution:** 
- Verify the new API route files were deployed
- Check that the app container is using the latest build

## Files That Should Exist After Deployment

```
✅ app/api/dashboard/integrations/chatwoot/create-user/route.ts
✅ app/api/dashboard/integrations/chatwoot/agents/route.ts
✅ app/api/dashboard/integrations/chatwoot/inboxes/route.ts
✅ app/api/dashboard/integrations/chatwoot/assign-agent/route.ts
✅ components/integrations/HelpdeskModal.tsx
✅ lib/chatwoot_helpdesk.ts
✅ prisma/migrations/add_helpdesk_models/migration.sql
```

## Verify Success

After completing all steps, you should be able to:
1. ✅ See "Helpdesk Setup" tile on Integrations page
2. ✅ Click the tile to open the modal
3. ✅ See existing helpdesk agents (if any)
4. ✅ Create new helpdesk agents
5. ✅ Manage agent inbox assignments

