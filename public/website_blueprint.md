brand:
  name: "LocalBox"
  domain: "localbox.ai"
  tagline: "AI-first customer support without per-seat or per-resolution fees"
  elevator_pitch: "LocalBox is a self-hosted AI-first customer support platform that ensures customers are always acknowledged while cutting operational costs. Unlike legacy vendors, you pay once for setup, own your data, and scale with unlimited agents and unlimited AI resolutions."

goals_success:
  primary_goal: "demo requests"
  secondary_goals: ["sales conversations","pilot deployments"]
  success_metrics: ["+30% qualified demos","<2.5s LCP"]

audience_positioning:
  primary_personas: ["Heads of Customer Support","Founders/COOs of scaling startups"]
  top_problems: ["High recurring SaaS costs with per-agent pricing","Customers waiting silently during gaps"]
  unique_value: "Unlimited usage, self-hosted, and built-in Holding AI ensures zero silent gaps at a fraction of competitor cost."
  objections_and_answers:
    - objection: "Why not just use Intercom/Zendesk since they are market leaders?"
      answer: "They charge per seat and per AI message, while we offer unlimited agents and unlimited AI with one-time setup. Plus you own the infrastructure and data."

references_competitors:
  sites_you_like:
    - url: "https://www.intercom.com"
      what_to_copy: "Clean, benefit-driven homepage flow"
    - url: "https://www.zendesk.com"
      what_to_copy: "Clear solutions navigation by use case"
    - url: "https://www.freshworks.com/freshchat"
      what_to_copy: "Visual step-by-step 'how it works'"
  competitors:
    - name: "Intercom"
      url: "https://www.intercom.com"
      how_you_differ: "No per-seat fees, unlimited AI, self-hosted"
    - name: "Zendesk"
      url: "https://www.zendesk.com"
      how_you_differ: "Flat cost, no per-resolution fees, zero vendor lock-in"
    - name: "Freshchat"
      url: "https://www.freshworks.com/freshchat"
      how_you_differ: "Holding AI layer ensures no silent waits, unlike static chatbots"

information_architecture:
  sitemap: ["Home","Features","How it Works","Industries","Results","Contact","About","FAQ","Legal","Blog"]
  nav_labels: ["Platform","Solutions","Pricing"]
  footer_links: [{label: "Privacy Policy", href: "/privacy"},{label: "Terms of Service", href: "/terms"}]

pages:
  home:
    hero_h1: "Customer support that never leaves users waiting"
    subhead: "Unlimited AI + unlimited agents, one-time setup, and full data ownership."
    bullets: ["No per-agent billing","No per-resolution fees","Own your data, unlimited scale"]
    ctas: [{label: "Request Implementation Plan", href: "/contact"},{label: "Learn How It Works", href: "/how-it-works"}]
    social_proof: "Trusted by early adopters replacing Intercom & Zendesk at 1/10th cost"
  features:
    heading: "Why Choose LocalBox"
    pillars:
      - title: "Unlimited Usage"
        benefit: "Add unlimited agents and handle unlimited AI conversations without extra cost."
      - title: "Self-Hosted Control"
        benefit: "You own your customer data and run on your infrastructure."
      - title: "Holding AI Agent"
        benefit: "Prevents silence by acknowledging customers if humans delay."
  how_it_works:
    heading: "How It Works"
    steps:
      - "Customer sends a message through your website chat widget"
      - "Main AI Agent answers instantly or escalates politely"
      - "System auto-assigns to the right team (Support, Sales, Tech, Billing, Feedback)"
      - "Human agent takes over seamlessly when available"
      - "Holding AI Agent re-engages if humans delay beyond SLA"
      - "AI Backup steps in if unanswered for client-defined window"
  industries:
    heading: "Built for Any Business Scaling Support"
    items:
      - title: "E-commerce"
        body: "Handle refund, shipping, and product inquiries instantly without agent overhead."
      - title: "SaaS"
        body: "Provide onboarding, billing, and technical answers 24/7 while keeping agent costs flat."
      - title: "Services"
        body: "Ensure no customer inquiry goes silent, from bookings to billing questions."
  results:
    heading: "Proven Outcomes"
    headline_metric: "95%+ customer questions answered automatically"
    proof_bullets: ["Reduce SaaS spend by up to 80% vs Intercom/Zendesk","Zero silent waits with Holding AI","Scale to unlimited agents at flat cost"]
  contact:
    heading: "Contact us for demo & pricing"
    blurb: "Discover how LocalBox can replace legacy tools and cut your costs."
    form_fields: ["name","email","company","website","use case","notes"]
    followup_sla: "We reply within 1 business day"
  faq:
    items:
      - q: "How is pricing structured?"
        a: "One-time setup fee, unlimited agents and AI usage, no recurring per-seat or per-message charges."
      - q: "Do I own my data?"
        a: "Yes, your instance is self-hosted, giving you full data ownership and compliance control."
      - q: "What happens if humans don’t reply?"
        a: "The Holding AI Agent acknowledges the user and can notify supervisors automatically."
      - q: "How does this differ from Intercom Fin or Zendesk bots?"
        a: "We provide unlimited AI usage, no per-resolution costs, and self-hosting so you’re not locked in."
      - q: "Is reporting included?"
        a: "Yes, full SLA and performance analytics are inherited from Chatwoot dashboards."
  about:
    mission: "Ensure every customer is acknowledged instantly without inflating support costs."
    story: "Built out of frustration with expensive SaaS support tools, LocalBox combines self-hosted Chatwoot with advanced AI orchestration to deliver predictable, scalable customer support."
    team_summary: "Founded by technologists with backgrounds in AI orchestration and Bitcoin-native infrastructure."
  legal:
    privacy_url: "/privacy"
    terms_url: "/terms"
    disclosures: "No sensitive data stored outside client-owned infrastructure."

content_assets:
  logo: "/assets/logo.png"
  hero_image: "/assets/hero.png"
  og_image: "/assets/og.png"
  screenshots: ["/assets/screenshot1.png","/assets/screenshot2.png"]
  brand_colors: {primary: "#0C4A6E", secondary: "#38BDF8", accent: "#FACC15"}
  typography: {heading: "Inter", body: "Roboto"}

voice_rules:
  tone: "Confident, clear, no jargon"
  do_say: ["Unlimited agents","Own your data"]
  dont_say: ["Cheap chatbot","Replacement for humans"]
  banned_terms: ["crypto","cryptocurrency"]

seo:
  keywords: ["AI customer support","self-hosted support platform","Chatwoot AI","Intercom alternative","Zendesk alternative"]
  home_title: "LocalBox - Unlimited Agents, Self-Hosted AI Support"
  home_meta_description: "LocalBox replaces Intercom/Zendesk with a self-hosted AI-first support system. Unlimited agents, unlimited AI resolutions, one-time setup, you own your data."
  schema_types: ["Organization","WebSite","Product","FAQPage"]

integrations_functionality:
  chat_widget: {provider: "Chatwoot", embed_ok: true}
  forms: {handler: "n8n", endpoint: "/webhook/contact"}
  analytics: {ga4_id: "G-XXXXXXX", events: ["page_view","cta_click","form_submit"]}
  crm_or_email: {provider: "SuiteCRM", list_or_pipeline: "demo leads"}
  special_functions: ["blog","search","dark_mode"]

operations_policies:
  support_channels: ["chat","email"]
  support_hours: "24/7 for AI; human coverage Mon–Fri, 9–5 EST"
  compliance_notes: ["GDPR/CCPA cookies banner","Self-hosted: client controls compliance"]

migration_redirects:
  old_site_url: "https://old.fusionai.com"
  pages_to_migrate: ["blog posts","case studies"]
  redirects: [{from: "/pricing", to: "/contact"}]

constraints_timeline:
  must_keep_design: true
  nonnegotiables: ["Unlimited agents messaging","Self-hosted only"]
  performance_budget: {lcp_seconds: 2.5}
  accessibility: "WCAG 2.1 AA"
  timeline: "MVP launch within 8 weeks"
  reviewer_approver: "Yilak Kidane"

open_questions:
  - "Do we want to offer optional managed hosting, or strictly self-host?"
  - "Should Holding AI Agent messages be customizable by client branding?"
