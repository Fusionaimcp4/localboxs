# LocalBox Database & Authentication Setup Guide

## Prerequisites

1. **PostgreSQL Database**: Install PostgreSQL locally or use a cloud service
2. **Environment Variables**: Set up your database connection

## Setup Steps

### 1. Database Configuration

Create a `.env.local` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/localboxs"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Existing LocalBox Configuration (keep your existing values)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
DEMO_DOMAIN="localhost:3000"
CHATWOOT_BASE_URL="https://chatwoot.mcp4.ai"
CHATWOOT_ACCOUNT_ID="1"
CHATWOOT_API_KEY="your_chatwoot_api_key_here"
N8N_BASE_URL="https://n8n.sost.work"
N8N_DUPLICATE_ENDPOINT="https://n8n.sost.work/webhook/duplicate-agent"
OPENAI_API_KEY="sk-your_openai_api_key_here"
SKELETON_PATH="./data/templates/n8n_System_Message.md"
DEMO_ROOT="./public/demos"
```

### 2. Database Migration

Run the following commands to set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Migrate existing demo data
npx tsx scripts/migrate-demos.ts
```

### 3. Create Admin User

Create an admin user for the system:

```bash
npx tsx scripts/create-admin-user.ts
```

### 4. Test the System

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/auth/signup` to create a new account
3. Visit `http://localhost:3000/auth/signin` to sign in
4. Visit `http://localhost:3000/dashboard` to access the dashboard

## Features Implemented

### ✅ Phase 1: Database & User Authentication Foundation

- **PostgreSQL Database**: Comprehensive schema for users, demos, workflows, contacts
- **NextAuth.js Integration**: Secure authentication with JWT sessions
- **User Registration**: Email/password registration with bcrypt hashing
- **User Dashboard**: Basic dashboard with stats and quick actions
- **Route Protection**: Middleware to protect authenticated routes
- **Data Migration**: Script to migrate existing JSON registry to database

### 🔄 Next Steps

The foundation is now ready for:
- **Phase 2**: Dashboard & System Message Management
- **Phase 3**: Workflow Control Interface
- **Phase 4**: AI Integration Management
- **Phase 5**: Modular Architecture & Future Expansion

## Database Schema

The database includes the following main entities:

- **Users**: User accounts with roles (USER, ADMIN, SUPER_ADMIN)
- **Demos**: AI support demos with Chatwoot integration
- **Workflows**: n8n workflow management and status
- **Contacts**: Lead management and contact tracking
- **ApiKeys**: AI model API key management
- **SystemMessages**: Versioned system message content
- **Integrations**: External service integrations
- **Analytics**: Event tracking and monitoring

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure session management
- **Route Protection**: Middleware-based authentication
- **Role-Based Access**: User roles for different permission levels
- **API Key Encryption**: Secure storage of API keys

## Migration Notes

- Existing demos are migrated to the admin user account
- All existing functionality is preserved
- File-based system messages are maintained
- Chatwoot and n8n integrations continue to work
- JSON registry is converted to database records

The system is now ready for the next phase of development!
