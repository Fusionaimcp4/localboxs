#!/usr/bin/env tsx

/**
 * Script to test system messages API
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function testSystemMessages() {
  try {
    console.log('🔍 Testing system messages...');

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mcp4.ai' }
    });

    if (!user) {
      console.log('❌ User admin@mcp4.ai not found');
      return;
    }

    // Get user's demos
    const demos = await prisma.demo.findMany({
      where: { userId: user.id },
      select: { id: true }
    });

    console.log(`📊 Found ${demos.length} demos for user`);

    // Get system messages
    const messages = await prisma.systemMessage.findMany({
      where: {
        demoId: {
          in: demos.map(d => d.id)
        }
      },
      include: {
        demo: {
          select: {
            businessName: true,
            slug: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`📋 Found ${messages.length} system messages:`);
    messages.forEach(msg => {
      console.log(`  - ${msg.demo.businessName} (${msg.demo.slug})`);
      console.log(`    Content length: ${msg.content.length} characters`);
      console.log(`    Version: ${msg.version}, Active: ${msg.isActive}`);
      console.log(`    Created: ${msg.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('✅ System messages API test complete!');

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testSystemMessages().catch(console.error);
