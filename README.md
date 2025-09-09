# LocalBox

LocalBox is a self-hosted AI-first customer support platform that ensures customers are always acknowledged while cutting operational costs. Unlike legacy vendors, you pay once for setup, own your data, and scale with unlimited agents and unlimited AI resolutions.

## Features

- **Unlimited Usage**: No per-seat or per-resolution fees
- **Self-Hosted Control**: You own your customer data and run on your infrastructure
- **AI + Human Hybrid**: Intelligent routing with "Holding AI" to prevent customer wait gaps
- **95%+ Automation**: Automated response rate with seamless human handoff
- **Full Data Ownership**: Complete control over your customer support data

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Integrations**: Chatwoot chat widget, Vercel Analytics
- **AI**: OpenAI GPT-4o-mini for knowledge base generation

## Business Demo Workflow

The Business Demo Workflow allows you to automatically generate AI-powered demo sites with custom knowledge bases extracted from any website.

### API Usage

```bash
POST /api/onboard
Content-Type: application/json

{
  "business_url": "https://example.com",
  "business_name": "Example Corp",
  "primary_color": "#0ea5e9",
  "secondary_color": "#111827",
  "logo_url": "https://example.com/logo.png"
}
```

### CLI Usage

```bash
ts-node scripts/onboard-business.ts --url https://fusion.mcp4.ai --name Fusion --primary "#0ea5e9" --secondary "#111827"
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Chatwoot
CHATWOOT_BASE_URL=https://chatwoot.mcp4.ai
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_API_KEY=your_chatwoot_api_key_here

# n8n API (for auto-cloning workflows)
N8N_BASE_URL=https://n8n.sost.work
N8N_API_KEY=your_n8n_api_key_here
MAIN_WORKFLOW_ID=your_main_workflow_id_here

# LLM
OPENAI_API_KEY=sk-your_openai_api_key_here

# Files/hosting
SKELETON_PATH=./data/templates/n8n_System_Message.md
DEMO_ROOT=./public/demos
DEMO_DOMAIN=localboxs.com
```

### Workflow Outputs

The system generates:

1. **Knowledge Base**: AI-extracted business information in Markdown format
2. **System Message**: Merged skeleton template with business-specific knowledge
3. **Demo Site**: Custom-branded HTML page with embedded Chatwoot widget
4. **Chatwoot Inbox**: Dedicated chat inbox for the business demo
5. **n8n Workflow**: Auto-cloned and configured workflow with business-specific settings
6. **Chatwoot Agent Bot**: Automated bot assigned to the inbox with proper webhook configuration
7. **Registry Entry**: JSON record of the created demo for tracking

### Auto-Cloning Features

When n8n API credentials are configured, the system automatically:

- **Clones** the main n8n workflow and renames it to the business name
- **Injects** the generated system message into the "Main AI" node
- **Updates** webhook node path to `<BusinessName>` with production URL `https://n8n.sost.work/webhook/<BusinessName>`
- **Creates** a Chatwoot Agent Bot named `<BusinessName> Bot`
- **Assigns** the bot to the new inbox with webhook URL pointing to n8n
- **Configures** all HTTP POST nodes with the bot's access token for authentication
- **Sets** proper headers (`api_access_token` and `Authorization: Bearer`) for Chatwoot API calls

### File Structure

```
/data/templates/n8n_System_Message.md        # Skeleton template
/data/registry/demos.json                    # Demo registry
/public/system_messages/                     # Generated system messages
/public/demos/<slug>/index.html              # Demo landing pages
/lib/                                        # Core utilities
/app/admin/onboard/                          # Admin UI
/app/api/onboard/                            # API endpoint
/scripts/onboard-business.ts                 # CLI tool
```

### Manual Steps After Generation

**With n8n API configured (automatic):**
1. ✅ n8n workflow automatically cloned and configured
2. ✅ System message automatically injected
3. ✅ Webhook path and URL automatically set
4. ✅ Chatwoot bot automatically created and assigned
5. Test the demo URL to ensure the chat widget works end-to-end

**Without n8n API (manual):**
1. Duplicate the Main n8n workflow in the n8n UI
2. Name the new workflow with the business name
3. Open the "Main AI" node and paste the generated system message content
4. Set webhook path to the business name
5. Create and assign Chatwoot bot manually
6. Test the demo URL to ensure the chat widget works end-to-end

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your API keys
4. Run the development server: `npm run dev`
5. Access the admin interface at `/admin/onboard`

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run CLI onboarding
ts-node scripts/onboard-business.ts --url https://example.com
```

## License

This project is private and proprietary to LocalBox/Fusion AI.
