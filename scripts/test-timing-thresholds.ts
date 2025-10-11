import dotenv from 'dotenv';
import { updateN8nWorkflowTimingThresholds } from '../lib/n8n-api';

// Load environment variables
dotenv.config();

async function testTimingThresholds() {
  console.log('🧪 Testing timing thresholds update...\n');

  // You'll need to replace this with an actual workflow ID from your database
  const testWorkflowId = process.env.TEST_WORKFLOW_ID || 'your-workflow-id-here';
  
  if (testWorkflowId === 'your-workflow-id-here') {
    console.log('❌ Please set TEST_WORKFLOW_ID in your .env file');
    console.log('   Example: TEST_WORKFLOW_ID=your-actual-n8n-workflow-id');
    return;
  }

  const testThresholds = {
    assigneeThreshold: 120, // 2 minutes
    teamThreshold: 180, // 3 minutes  
    escalationThreshold: 600 // 10 minutes
  };

  try {
    console.log(`🔄 Updating timing thresholds for workflow: ${testWorkflowId}`);
    console.log('📋 New thresholds:', testThresholds);
    
    const result = await updateN8nWorkflowTimingThresholds(testWorkflowId, testThresholds);
    
    console.log('✅ Timing thresholds updated successfully!');
    console.log('📋 Workflow updated:', result.name);
    
  } catch (error) {
    console.error('❌ Failed to update timing thresholds:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        console.log('\n💡 Make sure the workflow ID exists and is correct');
      }
      if (error.message.includes('401')) {
        console.log('\n💡 Check your N8N_API_KEY in .env file');
      }
    }
  }
}

testTimingThresholds();
