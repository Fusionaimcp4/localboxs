import { NextRequest, NextResponse } from 'next/server';
import { fetchAndClean } from '@/lib/scrape';
import { generateKBFromWebsite } from '@/lib/llm';
import { mergeKBIntoSkeleton } from '@/lib/merge';
import { createWebsiteInbox } from '@/lib/chatwoot';
import { renderDemoHTML } from '@/lib/renderDemo';
import { slugify } from '@/lib/slug';
import { writeTextFile, readTextFileIfExists, atomicJSONUpdate } from '@/lib/fsutils';
import { getWorkflow, createWorkflow, patchWorkflowForBusiness } from '@/lib/n8n';
import { createAgentBot, assignBotToInbox } from '@/lib/chatwoot_admin';
import path from 'path';

export const runtime = "nodejs";

export interface OnboardPayload {
  business_url: string;
  business_name?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
}

export interface DemoRegistry {
  [slug: string]: {
    slug: string;
    business: string;
    url: string;
    system_message_file: string;
    demo_url: string;
    chatwoot: {
      inbox_id: number;
      website_token: string;
    };
    workflow_id?: string;
    agent_bot?: {
      id: number | string;
      access_token: string;
    };
    created_at: string;
    updated_at?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload: OnboardPayload = await request.json();
    
    // Validate input
    if (!payload.business_url) {
      return NextResponse.json(
        { error: 'business_url is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let url: URL;
    try {
      url = new URL(payload.business_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid business_url format' },
        { status: 400 }
      );
    }

    // Infer business name from hostname if not provided
    const businessName = payload.business_name || url.hostname.replace(/^www\./, '');
    const slug = slugify(businessName);

    if (!slug) {
      return NextResponse.json(
        { error: 'Could not generate valid slug from business name' },
        { status: 400 }
      );
    }

    // Step 1: Fetch and clean website content
    const { cleanedText } = await fetchAndClean(payload.business_url);

    // Step 2: Generate knowledge base
    const kbMarkdown = await generateKBFromWebsite(cleanedText, payload.business_url);

    // Step 3: Load skeleton template
    const skeletonPath = process.env.SKELETON_PATH || './data/templates/n8n_System_Message.md';
    const skeletonText = await readTextFileIfExists(skeletonPath);
    
    if (!skeletonText) {
      return NextResponse.json(
        { error: 'Skeleton template not found' },
        { status: 500 }
      );
    }

    // Step 4: Merge KB into skeleton
    const finalSystemMessage = mergeKBIntoSkeleton(skeletonText, kbMarkdown);

    // Step 5: Write system message file
    const systemMessageFile = `./public/system_messages/n8n_System_Message_${businessName}.md`;
    await writeTextFile(systemMessageFile, finalSystemMessage);

    // Step 6: Create demo URL and Chatwoot inbox
    const demoDomain = process.env.DEMO_DOMAIN || 'localboxs.com';
    const demoUrl = `https://${slug}-demo.${demoDomain}`;
    
    const { inbox_id, website_token } = await createWebsiteInbox(businessName, demoUrl);

    // Step 7: Render demo HTML
    const chatwootBaseUrl = process.env.CHATWOOT_BASE_URL || 'https://chatwoot.mcp4.ai';
    const demoHTML = renderDemoHTML({
      businessName,
      slug,
      primary: payload.primary_color,
      secondary: payload.secondary_color,
      logoUrl: payload.logo_url,
      chatwootBaseUrl,
      websiteToken: website_token
    });

    // Step 8: Write demo HTML file
    const demoRoot = process.env.DEMO_ROOT || './public/demos';
    const demoIndexPath = path.join(demoRoot, slug, 'index.html');
    await writeTextFile(demoIndexPath, demoHTML);

    // Step 9: Auto-clone n8n workflow and setup Chatwoot bot
    const N8N_READY = !!(process.env.N8N_BASE_URL && process.env.N8N_API_KEY && process.env.MAIN_WORKFLOW_ID);
    let workflowId: string | undefined;
    let botId: number | string | undefined;
    let botAccessToken: string | undefined;
    let botSetupSkipped = false;
    let botSetupReason = '';

    try {
      // 1) Create Chatwoot Agent Bot named "<BusinessName> Bot" with webhook https://n8n.sost.work/webhook/<BusinessName>
      const bot = await createAgentBot(businessName);
      botId = bot.id;
      botAccessToken = bot.access_token;

      // 2) Assign bot to the newly created inbox
      await assignBotToInbox(inbox_id, botId);

      // 3) Clone n8n Main and patch it
      if (N8N_READY) {
        const main = await getWorkflow(process.env.MAIN_WORKFLOW_ID!);
        main.name = businessName;

        // wipe identity so POST creates a new workflow
        delete main.id; 
        delete main.staticData; 
        delete main.createdAt; 
        delete main.updatedAt;

        // inject system message, set webhook path/URL, and add bot token to Chatwoot HTTP nodes
        patchWorkflowForBusiness(main, businessName, finalSystemMessage, botAccessToken || "");

        const created = await createWorkflow(main);
        workflowId = created.id;
      }
    } catch (e: any) {
      console.error("Auto-create n8n/bot failed:", e);
      
      // Handle agent bot API not available
      if (e.message === 'AGENT_BOT_API_NOT_AVAILABLE') {
        botSetupSkipped = true;
        botSetupReason = 'Agent bot API not available; configure via UI.';
      }
    }

    // Step 10: Update registry
    const registryPath = './data/registry/demos.json';
    await atomicJSONUpdate<DemoRegistry>(registryPath, (registry) => {
      const now = new Date().toISOString();
      const existingEntry = registry[slug];
      
      registry[slug] = {
        slug,
        business: businessName,
        url: payload.business_url,
        system_message_file: systemMessageFile,
        demo_url: demoUrl,
        chatwoot: {
          inbox_id,
          website_token
        },
        ...(workflowId && { workflow_id: workflowId }),
        ...(botId && botAccessToken && { 
          agent_bot: { 
            id: botId, 
            access_token: botAccessToken 
          } 
        }),
        created_at: existingEntry?.created_at || now,
        ...(existingEntry && { updated_at: now })
      };
      
      return registry;
    });

    // Step 11: Return success response
    const response: any = {
      slug,
      business: businessName,
      url: payload.business_url,
      system_message_file: systemMessageFile,
      demo_url: demoUrl,
      chatwoot: {
        inbox_id,
        website_token
      },
      ...(workflowId && { workflow_id: workflowId }),
      ...(botId && botAccessToken && { 
        agent_bot: { 
          id: botId, 
          access_token: botAccessToken 
        } 
      }),
      created_at: new Date().toISOString()
    };

    // Handle bot setup failures
    if (botSetupSkipped) {
      response.bot_setup_skipped = true;
      response.reason = botSetupReason;
      response.suggested_steps = ["Create bot", "Set webhook", "Assign to inbox"];
    } else if (workflowId && botId) {
      // Add success notes
      response.notes = {
        chatwoot_bot: `Created ${businessName} Bot, webhook set to https://n8n.sost.work/webhook/${businessName}, assigned to the new inbox.`,
        n8n_webhook: `Cloned workflow has Webhook node path set to ${businessName}; production URL uses https://n8n.sost.work/webhook/${businessName}.`,
        http_nodes_auth: "All Chatwoot HTTP POST nodes updated with bot token in headers (api_access_token + Authorization: Bearer ...)."
      };
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Onboard API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Chatwoot')) {
        return NextResponse.json(
          { error: 'Chatwoot inbox create failed' },
          { status: 502 }
        );
      }
      
      if (error.message.includes('EACCES') || error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'File permission denied. Check DEMO_ROOT permissions.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
