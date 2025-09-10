import { NextRequest, NextResponse } from 'next/server';
import { fetchAndClean } from '@/lib/scrape';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
      if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch and clean website content
    const { cleanedText } = await fetchAndClean(url);
    
    // Extract basic business info (simplified version)
    const businessName = validatedUrl.hostname.replace(/^www\./, '');
    
    // Create a simple summary from the cleaned text
    const summary = cleanedText.length > 200 
      ? cleanedText.substring(0, 200) + '...' 
      : cleanedText;

    const businessInfo = {
      url,
      name: businessName,
      summary: summary,
      primaryColor: '#0ea5e9',
      secondaryColor: '#38bdf8',
      // logoUrl could be extracted from the page if needed
    };

    return NextResponse.json(businessInfo, { status: 200 });

  } catch (error) {
    console.error('Demo inspect API error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // Website fetching errors
      if (errorMessage.includes('not accessible') || errorMessage.includes('connection refused')) {
        return NextResponse.json(
          { error: `Website not accessible: ${errorMessage}` },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('SSL certificate error')) {
        return NextResponse.json(
          { error: `SSL certificate issue: ${errorMessage}` },
          { status: 400 }
        );
      }
      
      if (errorMessage.includes('Timeout error')) {
        return NextResponse.json(
          { error: `Website timeout: ${errorMessage}` },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to inspect website: ${errorMessage}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
