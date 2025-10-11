"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Workflow {
  id: string;
  demoId: string;
  n8nWorkflowId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PENDING';
  configuration: {
    aiModel?: string;
    confidenceThreshold?: number;
    escalationRules?: any[];
    externalIntegrations?: any[];
    timingThresholds?: {
      assigneeThreshold?: number; // seconds to wait after human response when assigned to agent
      teamThreshold?: number; // seconds to wait when assigned to team
      escalationThreshold?: number; // seconds before escalating to supervisor
      escalationContact?: string; // supervisor name for escalation
      escalationMessage?: string; // custom message for escalation notification
    };
  };
  createdAt: string;
  updatedAt: string;
  demo: {
    businessName: string;
    slug: string;
    demoUrl: string;
  };
}

interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  inactiveWorkflows: number;
  errorWorkflows: number;
}

interface FusionModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  isActive: boolean;
  supportsJsonMode: boolean;
  supportsToolUse: boolean;
  supportsVision: boolean;
  contextLength: number;
  inputCost: number;
  outputCost: number;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    inactiveWorkflows: 0,
    errorWorkflows: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [timingThresholds, setTimingThresholds] = useState({
    assigneeThreshold: 300, // 5 minutes default
    teamThreshold: 100, // ~1.7 minutes default
    escalationThreshold: 1800, // 30 minutes default
    escalationContact: '',
    escalationMessage: ''
  });
  const [availableModels, setAvailableModels] = useState<FusionModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [switchingModel, setSwitchingModel] = useState(false);

  useEffect(() => {
    fetchWorkflows();
    fetchAvailableModels();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/dashboard/workflows');
      const data = await response.json();
      
      if (response.ok) {
        setWorkflows(data.workflows);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('/api/dashboard/models');
      const data = await response.json();
      
      if (response.ok) {
        setAvailableModels(data.models);
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }
  };

  const handleWorkflowAction = async (workflowId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      console.log(`🔄 ${action} workflow ${workflowId}...`);
      
      const response = await fetch(`/api/dashboard/workflows/${workflowId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Workflow ${action} successful:`, data);
        // Refresh workflows after action
        fetchWorkflows();
        alert(`Workflow ${action} successful!`);
      } else {
        console.error(`❌ Workflow ${action} failed:`, data);
        alert(`Failed to ${action} workflow: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`💥 Failed to ${action} workflow:`, error);
      alert(`Failed to ${action} workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'INACTIVE': return 'bg-zinc-500/20 text-zinc-400';
      case 'ERROR': return 'bg-red-500/20 text-red-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const handleOpenConfiguration = (workflow: Workflow) => {
    // Set current timing thresholds from workflow configuration
    const currentThresholds = {
      assigneeThreshold: workflow.configuration.timingThresholds?.assigneeThreshold ?? 300,
      teamThreshold: workflow.configuration.timingThresholds?.teamThreshold ?? 100,
      escalationThreshold: workflow.configuration.timingThresholds?.escalationThreshold ?? 1800,
      escalationContact: workflow.configuration.timingThresholds?.escalationContact ?? '',
      escalationMessage: workflow.configuration.timingThresholds?.escalationMessage ?? ''
    };
    setTimingThresholds(currentThresholds);
    setSelectedModel(workflow.configuration.aiModel || '');
    setSelectedWorkflow(workflow);
  };

  const handleModelSwitch = async () => {
    if (!selectedWorkflow || !selectedModel) return;
    
    setSwitchingModel(true);
    try {
      const response = await fetch(`/api/dashboard/workflows/${selectedWorkflow.id}/switch-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: selectedWorkflow.id,
          model: selectedModel
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        // Refresh workflows to show updated model
        fetchWorkflows();
        setSelectedWorkflow(null);
      } else {
        alert(`Failed to switch model: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to switch model:', error);
      alert(`Failed to switch model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSwitchingModel(false);
    }
  };

  const handleSaveTimingThresholds = async () => {
    if (!selectedWorkflow) return;
    
    try {
      const response = await fetch(`/api/dashboard/workflows/${selectedWorkflow.id}/timing-thresholds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: selectedWorkflow.id,
          assigneeThreshold: timingThresholds.assigneeThreshold,
          teamThreshold: timingThresholds.teamThreshold,
          escalationThreshold: timingThresholds.escalationThreshold,
          escalationContact: timingThresholds.escalationContact,
          escalationMessage: timingThresholds.escalationMessage
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        // Refresh workflows to show updated thresholds
        fetchWorkflows();
        setSelectedWorkflow(null);
      } else {
        alert(`Failed to save timing thresholds: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save timing thresholds:', error);
      alert(`Failed to save timing thresholds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatSecondsToMinutes = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Workflow Management
              </h1>
              <p className="text-xl text-zinc-400">
                Control and monitor your AI support workflows
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{stats.totalWorkflows}</h3>
            <p className="text-zinc-400">Total Workflows</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-green-400 mb-2">{stats.activeWorkflows}</h3>
            <p className="text-zinc-400">Active</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">{stats.inactiveWorkflows}</h3>
            <p className="text-zinc-400">Inactive</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-red-400 mb-2">{stats.errorWorkflows}</h3>
            <p className="text-zinc-400">Errors</p>
          </div>
        </motion.div>

        {/* Workflows List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {workflows.length > 0 ? (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{workflow.demo.businessName}</h3>
                    <p className="text-sm text-zinc-400">{workflow.demo.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <div className="flex gap-2">
                      {workflow.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleWorkflowAction(workflow.id, 'stop')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleWorkflowAction(workflow.id, 'start')}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleWorkflowAction(workflow.id, 'restart')}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Restart
                      </button>
                      <button
                        onClick={() => handleOpenConfiguration(workflow)}
                        className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors text-sm"
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">AI Model:</span>
                    <span className="text-zinc-300 ml-2">
                      {workflow.configuration.aiModel 
                        ? availableModels.find(m => m.id === workflow.configuration.aiModel)?.name || workflow.configuration.aiModel
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Assignee Wait:</span>
                    <span className="text-zinc-300 ml-2">
                      {workflow.configuration.timingThresholds?.assigneeThreshold 
                        ? formatSecondsToMinutes(workflow.configuration.timingThresholds.assigneeThreshold)
                        : '5m'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Team Wait:</span>
                    <span className="text-zinc-300 ml-2">
                      {workflow.configuration.timingThresholds?.teamThreshold 
                        ? formatSecondsToMinutes(workflow.configuration.timingThresholds.teamThreshold)
                        : '1m 40s'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link
                    href={workflow.demo.demoUrl}
                    target="_blank"
                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
                  >
                    View Demo
                  </Link>
                  <Link
                    href={`/dashboard/workflows/${workflow.id}/logs`}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                  >
                    View Logs
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">No Workflows Found</h3>
              <p className="text-zinc-400 mb-6">
                Workflows are created automatically when you create demos. Create your first demo to get started.
              </p>
              <Link
                href="/userdemo"
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Create Your First Demo
              </Link>
            </div>
          )}
        </motion.div>

        {/* Workflow Configuration Modal */}
        {selectedWorkflow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Configure Workflow</h2>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-zinc-400 hover:text-zinc-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    AI Model
                  </label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100"
                  >
                    <option value="">Select a model...</option>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                  {selectedModel && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleModelSwitch}
                        disabled={switchingModel || selectedModel === selectedWorkflow?.configuration.aiModel}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {switchingModel ? 'Switching...' : 'Switch Model'}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Timing Thresholds Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-200">Hold AI Response Timing</h3>
                  <p className="text-sm text-zinc-400">Configure how long to wait before the Hold AI responds in different scenarios.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Assignee Threshold
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="60"
                        max="1800"
                        step="30"
                        value={timingThresholds.assigneeThreshold}
                        onChange={(e) => setTimingThresholds(prev => ({ ...prev, assigneeThreshold: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-zinc-300 min-w-[80px]">
                        {formatSecondsToMinutes(timingThresholds.assigneeThreshold)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Wait time after human response when assigned to specific agent</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Team Threshold
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="30"
                        max="600"
                        step="15"
                        value={timingThresholds.teamThreshold}
                        onChange={(e) => setTimingThresholds(prev => ({ ...prev, teamThreshold: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-zinc-300 min-w-[80px]">
                        {formatSecondsToMinutes(timingThresholds.teamThreshold)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Wait time when assigned to a team</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-200 mb-2">
                      Escalation Threshold
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="300"
                        max="7200"
                        step="60"
                        value={timingThresholds.escalationThreshold}
                        onChange={(e) => setTimingThresholds(prev => ({ ...prev, escalationThreshold: parseInt(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm text-zinc-300 min-w-[80px]">
                        {formatSecondsToMinutes(timingThresholds.escalationThreshold)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Wait time before escalating to supervisor</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Escalation Contact
                  </label>
                  <input
                    type="text"
                    value={timingThresholds.escalationContact}
                    onChange={(e) => setTimingThresholds(prev => ({ ...prev, escalationContact: e.target.value }))}
                    className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100"
                    placeholder="Enter supervisor name (e.g., Jon Monark)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Escalation Message
                  </label>
                  <textarea
                    value={timingThresholds.escalationMessage}
                    onChange={(e) => setTimingThresholds(prev => ({ ...prev, escalationMessage: e.target.value }))}
                    className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100 h-24"
                    placeholder="Enter custom message to include in supervisor notification..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveTimingThresholds}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
