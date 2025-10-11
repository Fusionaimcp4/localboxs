"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Integration {
  id: string;
  name: string;
  type: 'CALENDAR' | 'DATABASE' | 'API' | 'WEBHOOK' | 'CRM';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  configuration: any;
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
  const [showAddModal, setShowAddModal] = useState(false);

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
                onClick={() => setShowAddModal(true)}
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
              { type: 'CALENDAR', name: 'Calendar Integration', description: 'Connect Google Calendar, Outlook, or other calendar services' },
              { type: 'DATABASE', name: 'Database Integration', description: 'Connect to PostgreSQL, MySQL, MongoDB, or other databases' },
              { type: 'API', name: 'API Integration', description: 'Connect to REST APIs, GraphQL endpoints, or custom services' },
              { type: 'WEBHOOK', name: 'Webhook Integration', description: 'Set up custom webhooks for real-time notifications' },
              { type: 'CRM', name: 'CRM Integration', description: 'Connect to Salesforce, HubSpot, or other CRM systems' },
            ].map((integration) => (
              <div
                key={integration.type}
                className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => setShowAddModal(true)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                  <h4 className="text-lg font-semibold">{integration.name}</h4>
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
            integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                    <div>
                      <h4 className="text-lg font-semibold">{integration.name}</h4>
                      <p className="text-sm text-zinc-400">{integration.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                    <button className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors text-sm">
                      Configure
                    </button>
                    <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-zinc-500">
                  Created: {new Date(integration.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">No Integrations Yet</h3>
              <p className="text-zinc-400 mb-6">
                Connect external services to enhance your AI workflows and automate more tasks.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Add Your First Integration
              </button>
            </div>
          )}
        </motion.div>

        {/* Add Integration Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Integration</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-zinc-400 hover:text-zinc-300 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Integration Type
                  </label>
                  <select className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100">
                    <option value="CALENDAR">📅 Calendar Integration</option>
                    <option value="DATABASE">🗄️ Database Integration</option>
                    <option value="API">🔌 API Integration</option>
                    <option value="WEBHOOK">🪝 Webhook Integration</option>
                    <option value="CRM">👥 CRM Integration</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Integration Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100"
                    placeholder="My Calendar Integration"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Configuration
                  </label>
                  <textarea
                    className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-zinc-500 outline-none px-4 py-3 text-zinc-100 h-32"
                    placeholder="Enter configuration details..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors">
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
