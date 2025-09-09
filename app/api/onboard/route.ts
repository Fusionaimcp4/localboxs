import { NextRequest, NextResponse } from 'next/server';
import { fetchAndClean } from '@/lib/scrape';
import { generateKBFromWebsite } from '@/lib/llm';
import { mergeKBIntoSkeleton } from '@/lib/merge';
import { createWebsiteInbox } from '@/lib/chatwoot';
import { renderDemoHTML } from '@/lib/renderDemo';
import { slugify } from '@/lib/slug';
import { writeTextFile, readTextFileIfExists, atomicJSONUpdate } from '@/lib/fsutils';
import path from 'path';

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

    // Step 9: Update registry
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
        created_at: existingEntry?.created_at || now,
        ...(existingEntry && { updated_at: now })
      };
      
      return registry;
    });

    // Step 10: Return success response
    const response = {
      slug,
      business: businessName,
      url: payload.business_url,
      system_message_file: systemMessageFile,
      demo_url: demoUrl,
      chatwoot: {
        inbox_id,
        website_token
      },
      created_at: new Date().toISOString()
    };

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
