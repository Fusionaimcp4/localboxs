"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardStats {
  totalDemos: number;
  activeWorkflows: number;
  totalContacts: number;
}

interface Demo {
  id: string;
  slug: string;
  businessName: string;
  businessUrl: string;
  demoUrl: string;
  systemMessageFile: string;
  createdAt: string;
  workflows: Array<{
    id: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDemos: 0,
    activeWorkflows: 0,
    totalContacts: 0,
  });
  const [recentDemos, setRecentDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    demo: Demo | null;
    domainName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    demo: null,
    domainName: '',
    isDeleting: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
        setRecentDemos(data.recentDemos);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDemo = (demo: Demo) => {
    setDeleteModal({
      isOpen: true,
      demo,
      domainName: '',
      isDeleting: false
    });
  };

  const confirmDeleteDemo = async () => {
    if (!deleteModal.demo || !deleteModal.domainName) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/dashboard/demos/${deleteModal.demo.slug}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainName: deleteModal.domainName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Remove demo from local state
        setRecentDemos(prev => prev.filter(d => d.id !== deleteModal.demo!.id));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalDemos: prev.totalDemos - 1
        }));

        // Close modal
        setDeleteModal({
          isOpen: false,
          demo: null,
          domainName: '',
          isDeleting: false
        });

        alert(data.message);
      } else {
        alert(`Failed to delete demo: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete demo:', error);
      alert(`Failed to delete demo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDeleteDemo = () => {
    setDeleteModal({
      isOpen: false,
      demo: null,
      domainName: '',
      isDeleting: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Header Skeleton */}
          <div className="mb-12 animate-pulse">
            <div className="h-10 bg-zinc-800/50 rounded-lg w-64 mb-4"></div>
            <div className="h-6 bg-zinc-800/50 rounded-lg w-96"></div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 animate-pulse">
                <div className="h-8 bg-zinc-800/50 rounded w-16 mb-2"></div>
                <div className="h-4 bg-zinc-800/50 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          {/* Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 animate-pulse">
                <div className="h-6 bg-zinc-800/50 rounded w-40 mb-4"></div>
                <div className="h-4 bg-zinc-800/50 rounded w-full mb-2"></div>
                <div className="h-4 bg-zinc-800/50 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Your Dashboard
          </h1>
          <p className="text-xl text-zinc-400">
            Manage your AI support demos and workflows
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">{stats.totalDemos}</h3>
            <p className="text-zinc-400">Your Demos</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{stats.activeWorkflows}</h3>
            <p className="text-zinc-400">Active Workflows</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-2">{stats.totalContacts}</h3>
            <p className="text-zinc-400">Total Contacts</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Link
            href="/userdemo"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">Create New Demo</h3>
            <p className="text-zinc-400 mb-6">
              Generate a new AI support demo for your business
            </p>
            <div className="text-emerald-400 font-medium">Get Started →</div>
          </Link>

          <Link
            href="/dashboard/system-messages"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">System Messages</h3>
            <p className="text-zinc-400 mb-6">
              Manage your AI system message templates
            </p>
            <div className="text-emerald-400 font-medium">Manage →</div>
          </Link>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          <Link
            href="/dashboard/workflows"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">Workflow Control</h3>
            <p className="text-zinc-400 mb-6">
              Start, stop, and monitor your AI workflows
            </p>
            <div className="text-emerald-400 font-medium">Control →</div>
          </Link>

          <Link
            href="/dashboard/integrations"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">Integrations</h3>
            <p className="text-zinc-400 mb-6">
              Connect external services and APIs
            </p>
            <div className="text-emerald-400 font-medium">Connect →</div>
          </Link>
        </motion.div>

        {/* Recent Demos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Your Recent Demos</h3>
            <Link
              href="/dashboard/demos"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentDemos.length > 0 ? (
              recentDemos.map((demo) => (
                <div
                  key={demo.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700"
                >
                  <div>
                    <h4 className="font-semibold">{demo.businessName}</h4>
                    <p className="text-sm text-zinc-400">{demo.businessUrl}</p>
                    <p className="text-xs text-zinc-500">{new Date(demo.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={demo.demoUrl}
                      target="_blank"
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
                    >
                      View Demo
                    </Link>
                    <button
                      onClick={() => handleDeleteDemo(demo)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-zinc-400 text-center py-8">
                <p>No demos yet.</p>
                <p className="text-sm mt-2">Create your first demo to get started!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-400">Delete Demo</h2>
              <button
                onClick={cancelDeleteDemo}
                className="text-zinc-400 hover:text-zinc-300 text-2xl"
                disabled={deleteModal.isDeleting}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-red-400 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-zinc-300 text-sm">
                  This will permanently delete:
                </p>
                <ul className="text-zinc-400 text-sm mt-2 ml-4 list-disc">
                  <li>The demo and all its data</li>
                  <li>Associated n8n workflow</li>
                  <li>System message files</li>
                  <li>Demo page files</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Type the domain name to confirm deletion:
                </label>
                <input
                  type="text"
                  value={deleteModal.domainName}
                  onChange={(e) => setDeleteModal(prev => ({ ...prev, domainName: e.target.value }))}
                  placeholder={deleteModal.demo?.businessName}
                  className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-red-500 outline-none px-4 py-3 text-zinc-100"
                  disabled={deleteModal.isDeleting}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Expected: <span className="text-zinc-300">{deleteModal.demo?.businessName}</span>
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDeleteDemo}
                className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors"
                disabled={deleteModal.isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDemo}
                disabled={deleteModal.isDeleting || deleteModal.domainName !== deleteModal.demo?.businessName}
                className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteModal.isDeleting ? 'Deleting...' : 'Delete Demo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
