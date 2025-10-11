/**
 * Test script to investigate n8n workflow structure and API
 */

import { getN8nWorkflow } from '../lib/n8n-api';

async function testWorkflowStructure() {
  try {
    console.log('🔍 Fetching workflow structure from n8n...');
    
    const workflowId = 'ruPzflt1xCvUHb0d'; // From the error log
    const workflow = await getN8nWorkflow(workflowId);
    
    console.log('📋 Workflow basic info:');
    console.log(`- ID: ${workflow.id}`);
    console.log(`- Name: ${workflow.name}`);
    console.log(`- Active: ${workflow.active}`);
    console.log(`- Nodes count: ${workflow.nodes.length}`);
    
    console.log('\n🔍 Looking for system message nodes...');
    
    // Find all nodes that might contain system messages
    const systemMessageNodes = workflow.nodes.filter((node: any) => 
      node.name?.toLowerCase().includes('system') || 
      node.name?.toLowerCase().includes('message') ||
      node.type === 'n8n-nodes-base.set'
    );
    
    console.log(`Found ${systemMessageNodes.length} potential system message nodes:`);
    
    systemMessageNodes.forEach((node: any, index: number) => {
      console.log(`\n--- Node ${index + 1} ---`);
      console.log(`Name: ${node.name}`);
      console.log(`Type: ${node.type}`);
      console.log(`Parameters:`, JSON.stringify(node.parameters, null, 2));
    });
    
    console.log('\n🔍 Full workflow structure:');
    console.log(JSON.stringify(workflow, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWorkflowStructure();
