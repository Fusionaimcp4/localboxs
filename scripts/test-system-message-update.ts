#!/usr/bin/env tsx

/**
 * Script to test system message update functionality
 */

import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function testSystemMessageUpdate() {
  try {
    console.log('🔍 Testing system message update...');

    // Find the Fin AI system message
    const systemMessage = await prisma.systemMessage.findFirst({
      where: {
        demo: {
          slug: 'fin-ai-8da80263'
        }
      },
      include: {
        demo: {
          include: {
            workflows: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    if (!systemMessage) {
      console.log('❌ Fin AI system message not found');
      return;
    }

    console.log('✅ System message found:', systemMessage.id);
    console.log('📋 Demo:', systemMessage.demo.businessName);
    console.log('📋 Workflow ID:', systemMessage.demo.workflows[0]?.n8nWorkflowId);
    console.log('📋 Content length:', systemMessage.content.length);

    // Test the update API
    const testContent = systemMessage.content + '\n\n<!-- Test update at ' + new Date().toISOString() + ' -->';
    
    console.log('\n🔄 Testing API update...');
    
    const response = await fetch('http://localhost:3000/api/dashboard/system-messages/' + systemMessage.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: systemMessage.id,
        content: testContent
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API update successful!');
      console.log('📋 Response:', data);
    } else {
      console.log('❌ API update failed:', data);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
testSystemMessageUpdate().catch(console.error);
