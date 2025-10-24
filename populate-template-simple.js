#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function populateSystemMessageTemplate() {
  try {
    console.log('🔄 Starting SystemMessageTemplate population...\n');

    // Check if template already exists
    const existingTemplate = await prisma.systemMessageTemplate.findFirst({
      where: { isActive: true },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        }
      }
    });

    if (existingTemplate) {
      console.log('✅ SystemMessageTemplate already exists:');
      console.log(`   ID: ${existingTemplate.id}`);
      console.log(`   Name: ${existingTemplate.name}`);
      console.log(`   Versions: ${existingTemplate.versions.length}`);
      console.log(`   Current Version: ${existingTemplate.versions[0]?.version || 'N/A'}`);
      console.log(`   Published: ${existingTemplate.versions.find(v => v.isPublished) ? 'Yes' : 'No'}`);
      
      const shouldOverwrite = process.argv.includes('--force');
      if (!shouldOverwrite) {
        console.log('\n⚠️  Template already exists. Use --force to overwrite.');
        console.log('   Example: node populate-template-simple.js --force');
        return;
      }
      
      console.log('\n🔄 Force mode enabled, proceeding with update...');
    }

    // Read template file
    const templatePath = path.join(process.cwd(), 'data/templates/n8n_System_Message.md');
    console.log(`📁 Reading template file: ${templatePath}`);
    
    let fileContent;
    try {
      fileContent = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      console.error('❌ Template file not found or cannot be read');
      console.error(`   Expected path: ${templatePath}`);
      console.error(`   Error: ${error.message}`);
      return;
    }
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error('❌ Template file is empty');
      return;
    }

    console.log(`✅ Template file loaded (${fileContent.length} characters)`);

    if (existingTemplate && process.argv.includes('--force')) {
      // Update existing template
      console.log('\n🔄 Updating existing template...');
      
      // Get next version number
      const nextVersion = existingTemplate.versions.length > 0 ? existingTemplate.versions[0].version + 1 : 1;
      
      // Unpublish current version
      await prisma.systemMessageVersion.updateMany({
        where: { 
          templateId: existingTemplate.id,
          isPublished: true 
        },
        data: { isPublished: false }
      });

      // Create new published version
      const newVersion = await prisma.systemMessageVersion.create({
        data: {
          templateId: existingTemplate.id,
          version: nextVersion,
          content: fileContent,
          isPublished: true,
          publishedAt: new Date(),
          publishedBy: 'system-script',
          changeLog: `Updated from file via populate script (v${nextVersion})`
        }
      });

      // Update template content
      const updatedTemplate = await prisma.systemMessageTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          content: fileContent,
          updatedAt: new Date()
        },
        include: {
          versions: {
            orderBy: { version: 'desc' }
          }
        }
      });

      console.log('✅ Template updated successfully:');
      console.log(`   Template ID: ${updatedTemplate.id}`);
      console.log(`   New Version: ${newVersion.version}`);
      console.log(`   Published: ${newVersion.isPublished ? 'Yes' : 'No'}`);
      console.log(`   Published At: ${newVersion.publishedAt}`);

    } else {
      // Create new template
      console.log('\n🆕 Creating new SystemMessageTemplate...');
      
      const newTemplate = await prisma.systemMessageTemplate.create({
        data: {
          name: 'Master System Message Template',
          description: 'The master template used for all demo creations',
          content: fileContent,
          isActive: true,
          versions: {
            create: {
              version: 1,
              content: fileContent,
              isPublished: true,
              publishedAt: new Date(),
              publishedBy: 'system-script',
              changeLog: 'Initial template created from file via populate script'
            }
          }
        },
        include: {
          versions: {
            orderBy: { version: 'desc' }
          }
        }
      });

      console.log('✅ SystemMessageTemplate created successfully:');
      console.log(`   Template ID: ${newTemplate.id}`);
      console.log(`   Name: ${newTemplate.name}`);
      console.log(`   Description: ${newTemplate.description}`);
      console.log(`   Active: ${newTemplate.isActive}`);
      console.log(`   Initial Version: ${newTemplate.versions[0].version}`);
      console.log(`   Published: ${newTemplate.versions[0].isPublished ? 'Yes' : 'No'}`);
    }

    // Verify the template can be retrieved
    console.log('\n🔍 Verifying template retrieval...');
    const publishedVersion = await prisma.systemMessageVersion.findFirst({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      include: {
        template: true
      }
    });

    if (publishedVersion) {
      console.log('✅ Published template verified:');
      console.log(`   Template: ${publishedVersion.template.name}`);
      console.log(`   Version: ${publishedVersion.version}`);
      console.log(`   Content Length: ${publishedVersion.content.length} characters`);
      console.log(`   Published By: ${publishedVersion.publishedBy}`);
    } else {
      console.log('❌ No published template found after creation');
    }

    console.log('\n🎉 SystemMessageTemplate population complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the admin/system-messages page');
    console.log('   2. Verify template validation works');
    console.log('   3. Test demo creation to ensure template is used');

  } catch (error) {
    console.error('💥 Error populating SystemMessageTemplate:', error);
    
    if (error.message) {
      console.error('   Message:', error.message);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📋 SystemMessageTemplate Population Script (Simple Version)

Usage:
  node populate-template-simple.js              # Check if template exists
  node populate-template-simple.js --force      # Force update existing template

Description:
  This script populates the SystemMessageTemplate table from the 
  data/templates/n8n_System_Message.md file.

Options:
  --force    Force update even if template already exists
  --help     Show this help message

Examples:
  node populate-template-simple.js
  node populate-template-simple.js --force
`);
  process.exit(0);
}

// Run the script
populateSystemMessageTemplate().catch(console.error);
