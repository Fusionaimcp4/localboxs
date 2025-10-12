"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CRMConfigModal } from "@/components/integrations/CRMConfigModal";
import { CRMConfiguration } from "@/lib/integrations/types";

interface Integration {
  id: string;
  name: string;
  type: 'CALENDAR' | 'DATABASE' | 'API' | 'WEBHOOK' | 'CRM';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  configuration: any;
  isActive: boolean;
  createdAt: string;
}

interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  inactiveIntegrations: number;
  errorIntegrations: number;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats>({
    totalIntegrations: 0,
    activeIntegrations: 0,
    inactiveIntegrations: 0,
    errorIntegrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCRMModal, setShowCRMModal] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/dashboard/integrations');
      const data = await response.json();
      
      if (response.ok) {
        setIntegrations(data.integrations);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = (type: string) => {
    setSelectedIntegrationType(type);
    if (type === 'CRM') {
      setShowCRMModal(true);
    } else {
      // For other types, show a "coming soon" message
      alert(`${type} integration coming soon!`);
    }
  };

  const handleEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    if (integration.type === 'CRM') {
      setShowCRMModal(true);
    } else {
      alert(`Editing ${integration.type} integration coming soon!`);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchIntegrations();
      } else {
        const error = await response.json();
        alert(`Failed to delete integration: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete integration:', error);
      alert('Failed to delete integration. Please try again.');
    }
  };

  const handleToggleActive = async (integrationId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/integrations/${integrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        await fetchIntegrations();
      } else {
        const error = await response.json();
        alert(`Failed to update integration: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to toggle integration status:', error);
      alert('Failed to update integration. Please try again.');
    }
  };

  const handleSaveCRM = async (name: string, configuration: CRMConfiguration) => {
    try {
      let response;

      if (editingIntegration) {
        // Update existing integration
        response = await fetch(`/api/dashboard/integrations/${editingIntegration.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            configuration,
          }),
        });
      } else {
        // Create new integration
        response = await fetch('/api/dashboard/integrations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            type: 'CRM',
            configuration,
          }),
        });
      }

      if (response.ok) {
        await fetchIntegrations();
        setShowCRMModal(false);
        setEditingIntegration(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save integration');
      }
    } catch (error) {
      console.error('Failed to save CRM integration:', error);
      throw error;
    }
  };

  const handleCloseCRMModal = () => {
    setShowCRMModal(false);
    setEditingIntegration(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400';
      case 'INACTIVE': return 'bg-zinc-500/20 text-zinc-400';
      case 'ERROR': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALENDAR': return '📅';
      case 'DATABASE': return '🗄️';
      case 'API': return '🔌';
      case 'WEBHOOK': return '🪝';
      case 'CRM': return '👥';
      default: return '🔗';
    }
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
                External Integrations
              </h1>
              <p className="text-xl text-zinc-400">
                Connect external services to enhance your AI workflows
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleAddIntegration('CRM')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Add Integration
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
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
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{stats.totalIntegrations}</h3>
            <p className="text-zinc-400">Total Integrations</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-green-400 mb-2">{stats.activeIntegrations}</h3>
            <p className="text-zinc-400">Active</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">{stats.inactiveIntegrations}</h3>
            <p className="text-zinc-400">Inactive</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-red-400 mb-2">{stats.errorIntegrations}</h3>
            <p className="text-zinc-400">Errors</p>
          </div>
        </motion.div>

        {/* Available Integration Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-semibold mb-6">Available Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { type: 'CRM', name: 'CRM Integration', description: 'Connect Chatwoot, Salesforce, HubSpot, or custom CRM systems', available: true },
              { type: 'CALENDAR', name: 'Calendar Integration', description: 'Connect Google Calendar, Outlook, or other calendar services', available: false },
              { type: 'DATABASE', name: 'Database Integration', description: 'Connect to PostgreSQL, MySQL, MongoDB, or other databases', available: false },
              { type: 'API', name: 'API Integration', description: 'Connect to REST APIs, GraphQL endpoints, or custom services', available: false },
              { type: 'WEBHOOK', name: 'Webhook Integration', description: 'Set up custom webhooks for real-time notifications', available: false },
            ].map((integration) => (
              <div
                key={integration.type}
                className={`bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 transition-colors ${
                  integration.available 
                    ? 'hover:border-zinc-700 cursor-pointer' 
                    : 'opacity-60'
                }`}
                onClick={() => integration.available && handleAddIntegration(integration.type)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                  <h4 className="text-lg font-semibold">
                    {integration.name}
                    {!integration.available && <span className="ml-2 text-xs text-zinc-500">(Coming Soon)</span>}
                  </h4>
                </div>
                <p className="text-zinc-400 text-sm">{integration.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Integrations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-semibold">Your Integrations</h3>
          
          {integrations.length > 0 ? (
            integrations.map((integration) => {
              const status = integration.isActive ? 'ACTIVE' : 'INACTIVE';
              const crmProvider = integration.type === 'CRM' ? integration.configuration?.provider : null;
              
              return (
                <div
                  key={integration.id}
                  className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                      <div>
                        <h4 className="text-lg font-semibold">{integration.name}</h4>
                        <p className="text-sm text-zinc-400">
                          {integration.type}
                          {crmProvider && ` - ${crmProvider}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => handleToggleActive(integration.id, integration.isActive)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        {integration.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditIntegration(integration)}
                        className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors text-sm"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-zinc-500">
                    Created: {new Date(integration.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">No Integrations Yet</h3>
              <p className="text-zinc-400 mb-6">
                Connect external services to enhance your AI workflows and automate more tasks.
              </p>
              <button
                onClick={() => handleAddIntegration('CRM')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Add Your First Integration
              </button>
            </div>
          )}
        </motion.div>

        {/* CRM Integration Modal */}
        <CRMConfigModal
          isOpen={showCRMModal}
          onClose={handleCloseCRMModal}
          onSave={handleSaveCRM}
          existingIntegration={editingIntegration ? {
            id: editingIntegration.id,
            name: editingIntegration.name,
            configuration: editingIntegration.configuration,
          } : undefined}
        />
      </div>
    </div>
  );
}
