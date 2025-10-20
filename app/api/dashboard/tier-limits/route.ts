import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllTierLimits } from '@/lib/dynamic-tier-limits';

// GET - Get all tier limits (for user dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tierLimits = await getAllTierLimits();
    
    return NextResponse.json({
      success: true,
      tierLimits
    });
  } catch (error) {
    console.error('Failed to fetch tier limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier limits' },
      { status: 500 }
    );
  }
}
