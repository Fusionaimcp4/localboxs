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
5. **Registry Entry**: JSON record of the created demo for tracking

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

1. Duplicate the Main n8n workflow in the n8n UI
2. Name the new workflow with the business name
3. Open the "Main AI" node and paste the generated system message content
4. Test the demo URL to ensure the chat widget works end-to-end

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
