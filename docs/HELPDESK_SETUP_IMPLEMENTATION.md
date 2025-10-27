# Helpdesk Setup Feature Implementation

**Date:** December 2024  
**Status:** ✅ Complete

## Overview

This document describes the implementation of the Helpdesk Setup feature, which allows LocalBoxs users to create and manage Chatwoot helpdesk agent accounts directly from their dashboard.

## Feature Description

The Helpdesk Setup feature repurposes the existing "Calendar Integration" tile to provide a comprehensive agent management interface. Users can:

1. **Create Helpdesk Agents** - Create new Chatwoot agent accounts with automatically generated plus-addressed emails
2. **Manage Collaborators** - View existing agents and assign/unassign them to inboxes using toggle switches

## Architecture

### Frontend Components

**Location:** `components/integrations/HelpdeskModal.tsx`

A React component implementing a tabbed interface:

- **Tab 1 - Create Agent:**
  - Form fields: Agent name, Password
  - Client-side password validation (min 8 chars, 1 number, 1 special char)
  - Displays tier-based agent limits
  - Shows generated email using plus-addressing
  
- **Tab 2 - Manage Collaborators:**
  - Lists all created agents with email addresses
  - Shows available inboxes (filtered to user's demos)
  - Toggle switches to assign/unassign agents to inboxes
  - Real-time updates via API calls

**Key Features:**
- Password strength validation with inline error messages
- Automatic email generation using plus-addressing (e.g., `user+agentname@domain.com`)
- Tier-based limits enforcement
- Clean, intuitive UI with proper error handling

### Backend API Routes

#### 1. Create Agent
**Endpoint:** `POST /api/dashboard/integrations/chatwoot/create-user`

**Location:** `app/api/dashboard/integrations/chatwoot/create-user/route.ts`

**Functionality:**
- Validates user session and subscription tier
- Checks tier-based agent limits
- Generates plus-addressed email using `generatePlusAddressedEmail`
- Creates Chatwoot user via `createChatwootUser`
- Saves agent to LocalBoxs database in `helpdesk_users` table
- Attempts to add user to Chatwoot account (may require manual assignment)

**Payload:**
```json
{
  "name": "agent-name",
  "password": "secure-password"
}
```

#### 2. List Agents
**Endpoint:** `GET /api/dashboard/integrations/chatwoot/agents`

**Location:** `app/api/dashboard/integrations/chatwoot/agents/route.ts`

**Functionality:**
- Returns all helpdesk agents created by the current user
- Includes agent name, email, Chatwoot user ID, and role

#### 3. List Inboxes
**Endpoint:** `GET /api/dashboard/integrations/chatwoot/inboxes`

**Location:** `app/api/dashboard/integrations/chatwoot/inboxes/route.ts`

**Functionality:**
- Returns inboxes associated with the user's demos
- Filters to only inboxes where user has created demos (`Demo.chatwootInboxId`)
- Provides inbox ID and name for assignment UI

#### 4. Assign/Unassign Agent
**Endpoint:** `POST /api/dashboard/integrations/chatwoot/assign-agent`

**Location:** `app/api/dashboard/integrations/chatwoot/assign-agent/route.ts`

**Functionality:**
- Adds or removes agents from inboxes
- Calls Chatwoot API to update inbox membership
- Updates LocalBoxs database (`helpdesk_user_inboxes` table)

**Payload:**
```json
{
  "agentId": "string",
  "inboxId": "number",
  "action": "add" | "remove"
}
```

### Chatwoot Integration Functions

**Location:** `lib/chatwoot_helpdesk.ts`

#### `generatePlusAddressedEmail(userId: string, agentName: string): string`
- Generates plus-addressed emails in the format: `user+agentname@domain.com`
- Example: `service+yimran@mcp4.ai`
- Used to avoid email conflicts and maintain unique agent accounts

#### `createChatwootUser(userId: string, name: string, email: string, password: string): Promise<{ chatwootUserId: number }>`
- Creates a new Chatwoot user account via the Chatwoot API
- Uses the account API endpoint: `POST /api/v1/accounts/{accountId}/users`
- Returns the Chatwoot user ID for storage
- **Note:** User may need manual assignment to the account if API fails

#### `addAgentToInbox(userId: string, agentId: number, inboxId: number): Promise<boolean>`
- Adds an agent to a Chatwoot inbox
- **Endpoint:** `POST /api/v1/accounts/{account_id}/inbox_members`
- **Payload:** `{ inbox_id, user_ids: [agentId] }`
- Returns success/failure status

#### `removeAgentFromInbox(userId: string, agentId: number, inboxId: number): Promise<boolean>`
- Removes an agent from a Chatwoot inbox
- **Endpoint:** `DELETE /api/v1/accounts/{account_id}/inbox_members/{inbox_id}/{user_id}`
- Returns success/failure status

#### `listInboxes(userId: string): Promise<ChatwootInbox[]>`
- Lists all inboxes for the user's account
- Filtered to only inboxes associated with user's demos
- Returns inbox ID and name

#### `listUsers(userId: string): Promise<ChatwootUser[]>`
- Lists all users in the Chatwoot account
- Returns user ID, name, and email

#### `getAgentLimitForTier(tier: string): number`
- Returns agent limit based on subscription tier:
  - FREE: 1 agent
  - PRO: 3 agents
  - PRO_PLUS: 5 agents
  - ENTERPRISE: Unlimited (999)
- Used for tier-based feature gating

### Database Schema

**Location:** `prisma/schema.prisma`

#### HelpdeskUser Model
```prisma
model HelpdeskUser {
  id                String   @id @default(cuid())
  userId            String
  name              String
  email             String
  chatwootUserId    Int?
  chatwootRole      String   @default("agent")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  inboxes         HelpdeskUserInbox[]
  
  @@map("helpdesk_users")
  @@index([userId])
}
```

#### HelpdeskUserInbox Model
```prisma
model HelpdeskUserInbox {
  id             String        @id @default(cuid())
  helpdeskUserId String
  inboxId        Int
  isActive       Boolean       @default(true)
  assignedAt     DateTime      @default(now())
  
  helpdeskUser HelpdeskUser @relation(fields: [helpdeskUserId], references: [id], onDelete: Cascade)
  
  @@unique([helpdeskUserId, inboxId])
  @@index([helpdeskUserId])
  @@index([inboxId])
  @@map("helpdesk_user_inboxes")
}
```

### Integration Type

**Location:** `prisma/schema.prisma`

Added `HELPDESK` to the `IntegrationType` enum:

```prisma
enum IntegrationType {
  HELPDESK  // New integration type
  // ... other types
}
```

## Implementation Steps

### 1. Database Schema
- Added `HELPDESK` to `IntegrationType` enum
- Created `HelpdeskUser` model
- Created `HelpdeskUserInbox` model
- Ran migration: `npx prisma db push`

### 2. Backend API Routes
- Created `/api/dashboard/integrations/chatwoot/create-user`
- Created `/api/dashboard/integrations/chatwoot/agents`
- Created `/api/dashboard/integrations/chatwoot/inboxes`
- Created `/api/dashboard/integrations/chatwoot/assign-agent`

### 3. Chatwoot Integration Functions
- Implemented `generatePlusAddressedEmail`
- Implemented `createChatwootUser`
- Implemented `addAgentToInbox` (using correct `/inbox_members` endpoint)
- Implemented `removeAgentFromInbox` (using correct DELETE endpoint)
- Implemented `listInboxes`
- Implemented `listUsers`
- Implemented `getAgentLimitForTier`

### 4. Frontend Component
- Created `HelpdeskModal.tsx` with tabbed interface
- Implemented password validation (client-side)
- Added inline error messages
- Implemented toggle switches for inbox assignment
- Added tier limit display and enforcement

### 5. Integration with Integrations Page
- Modified `app/dashboard/integrations/page.tsx`
- Replaced `CALENDAR` integration tile with `HELPDESK`
- Added icon mapping for `HELPDESK` type
- Connected modal opening to integration tile click

## Key Technical Decisions

### 1. API Endpoint Choice
Initially attempted to use `/agents` endpoint, but discovered the correct Chatwoot API endpoints for inbox membership are:
- **Add:** `POST /api/v1/accounts/{account_id}/inbox_members` with `{ inbox_id, user_ids: [agentId] }`
- **Remove:** `DELETE /api/v1/accounts/{account_id}/inbox_members/{inbox_id}/{user_id}`

### 2. Password Validation
Implemented client-side validation to match Chatwoot's password requirements:
- Minimum 8 characters
- At least 1 number (0-9)
- At least 1 special character

This prevents user frustration from API errors after form submission.

### 3. Plus-Addressing
Used plus-addressing (`user+agentname@domain.com`) to:
- Create unique emails for each agent
- Avoid email conflicts in the Chatwoot system
- Maintain traceability back to the LocalBoxs user

### 4. Multi-Tenant Isolation
- Inboxes are filtered to only those associated with the user's demos
- Users can only manage their own agents
- Database foreign keys ensure data integrity

### 5. Tier-Based Limits
Implemented tier-based agent limits to match the subscription model:
- Free: 1 agent
- Pro: 3 agents
- Pro+: 5 agents
- Enterprise: Unlimited

## Testing Checklist

- [x] Create agent with valid password
- [x] Create agent with invalid password (shows errors)
- [x] Respect tier-based limits (block creation if limit reached)
- [x] Assign agent to inbox (toggle on)
- [x] Unassign agent from inbox (toggle off)
- [x] View agents list in "Manage Collaborators" tab
- [x] Multi-tenant isolation (only see own agents and inboxes)
- [x] Password validation inline feedback
- [x] Generated email display
- [x] Error handling for API failures

## Environment Variables

Required environment variables:

```bash
CHATWOOT_BASE_URL=https://chatwoot.mcp4.ai
CHATWOOT_API_KEY=<admin-api-key>
CHATWOOT_ACCOUNT_ID=<account-id>
DATABASE_URL=<postgresql-connection-string>
```

## Future Enhancements

1. **Enterprise Tier:**
   - Show connection status to standalone Chatwoot instance
   - Ability to configure standalone Chatwoot URL

2. **Agent Management:**
   - Edit agent details
   - Delete agent accounts
   - Reset agent passwords

3. **Advanced Features:**
   - Role-based permissions for agents
   - Bulk agent operations
   - Agent activity tracking

4. **UI Improvements:**
   - Search/filter agents
   - Sort inboxes
   - Loading skeletons
   - Success toasts

## Deployment Notes

1. Run Prisma migration on production:
   ```bash
   npx prisma db push
   ```

2. Environment variables are already configured on the server

3. No additional Docker configuration needed

4. The feature is immediately available after deployment

## Troubleshooting

### Chatwoot API Returns 404
- Check that the Chatwoot API key has correct permissions
- Verify the account ID matches the Chatwoot instance
- Ensure the endpoint URL is correct (`/inbox_members` not `/agents`)

### Foreign Key Violation
- Ensure the user exists in the database
- Check that `session.user.id` corresponds to a valid User record
- Fallback to lookup by email if ID lookup fails

### Password Validation Errors
- Password must meet Chatwoot's requirements
- Client-side validation should catch most cases
- Check network tab for API response details

### Empty Inbox List
- Ensure user has created demos with Chatwoot integration
- Check that demos have valid `chatwootInboxId` values
- Verify multi-tenant filtering logic

## References

- Chatwoot API Documentation: https://developers.chatwoot.com/api-reference/inboxes/add-a-new-agent
- Prisma Schema: `prisma/schema.prisma`
- Component: `components/integrations/HelpdeskModal.tsx`
- API Routes: `app/api/dashboard/integrations/chatwoot/`
- Chatwoot Integration: `lib/chatwoot_helpdesk.ts`

