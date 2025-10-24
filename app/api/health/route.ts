import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Basic health check
    const healthData: any = { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown'
    };

    // Try to check database connection if available
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        healthData.database = 'connected';
      } catch (dbError) {
        console.error('Database health check failed:', dbError);
        healthData.database = 'disconnected';
        // Don't fail the health check for DB issues in production
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json(healthData, { status: 200 });
        }
      }
    } else {
      healthData.database = 'not_configured';
    }

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
