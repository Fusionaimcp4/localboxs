# Quick Fix: Run Database Migration on Server

The `helpdesk_users` table doesn't exist yet. Run these commands on your server:

## SSH into your server

```bash
ssh root@sostwallet
cd /opt/localboxs
```

## Run the Migration

```bash
# Check migration status
npx prisma migrate status

# Deploy pending migrations
npx prisma migrate deploy

# Regenerate Prisma Client
npx prisma generate

# Restart the app container
docker-compose -f docker-compose.prod.yml restart app
```

## If Migration Fails

If you get an error like "Migration already applied", you may need to reset:

```bash
# WARNING: This will reset your database!
# Only do this if you have no important data yet

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Reset database (ONLY if you're okay losing data)
npx prisma migrate reset --force

# Start containers again
docker-compose -f docker-compose.prod.yml up -d
```

## Verify Migration Success

After running the migration, verify the table was created:

```bash
# Enter the PostgreSQL container
docker exec -it localboxs_postgres psql -U postgres -d localboxs

# In PostgreSQL shell, run:
\dt helpdesk_users
\dt helpdesk_user_inboxes

# Should show:
# helpdesk_users
# helpdesk_user_inboxes

# Exit PostgreSQL
\q
```

## Alternative: Run Migration Directly in Container

If you're having issues, you can run the migration inside the Docker container:

```bash
# Enter the app container
docker exec -it localboxs_app sh

# Inside container, run:
npx prisma migrate deploy
npx prisma generate

# Exit container
exit

# Restart
docker restart localboxs_app
```

