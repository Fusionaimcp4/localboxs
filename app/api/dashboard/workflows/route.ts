import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user's workflows
    const workflows = await prisma.workflow.findMany({
      where: {
        userId
      },
      include: {
        demo: {
          select: {
            businessName: true,
            slug: true,
            demoUrl: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Calculate stats
    const stats = {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'ACTIVE').length,
      inactiveWorkflows: workflows.filter(w => w.status === 'INACTIVE').length,
      errorWorkflows: workflows.filter(w => w.status === 'ERROR').length,
    };

    return NextResponse.json({
      workflows,
      stats
    });

  } catch (error) {
    console.error('Workflows API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}
