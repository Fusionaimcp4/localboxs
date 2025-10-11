"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
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
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const response = await fetch('/api/dashboard/demos');
      const data = await response.json();
      
      if (response.ok) {
        setDemos(data.demos);
      }
    } catch (error) {
      console.error('Failed to fetch demos:', error);
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
        setDemos(prev => prev.filter(d => d.id !== deleteModal.demo!.id));
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
                Your Demos
              </h1>
              <p className="text-xl text-zinc-400">
                Manage and monitor your AI support demos
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/userdemo"
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Create New Demo
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Demos List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {demos.length > 0 ? (
            demos.map((demo) => (
              <div
                key={demo.id}
                className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{demo.businessName}</h3>
                    <p className="text-sm text-zinc-400">{demo.businessUrl}</p>
                    <p className="text-xs text-zinc-500">{new Date(demo.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                      Active
                    </span>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Demo URL:</span>
                    <span className="text-zinc-300 ml-2 break-all">{demo.demoUrl}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Workflows:</span>
                    <span className="text-zinc-300 ml-2">{demo.workflows.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">System Message:</span>
                    <span className="text-zinc-300 ml-2">Active</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/workflows`}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Manage Workflows
                  </Link>
                  <Link
                    href={`/dashboard/system-messages`}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                  >
                    Edit System Message
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">No Demos Yet</h3>
              <p className="text-zinc-400 mb-6">
                Create your first AI support demo to get started with LocalBox.
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
                  <li>Chatwoot inbox and bot</li>
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
