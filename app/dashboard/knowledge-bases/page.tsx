"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Database, FileText, Zap, AlertCircle } from "lucide-react";

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
  isActive: boolean;
  createdAt: string;
  documentCount: number;
  workflowCount: number;
}

interface KBStats {
  total: number;
  active: number;
  totalDocuments: number;
  totalTokens: number;
}

export default function KnowledgeBasesPage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [stats, setStats] = useState<KBStats>({
    total: 0,
    active: 0,
    totalDocuments: 0,
    totalTokens: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch('/api/dashboard/knowledge-bases');
      const data = await response.json();
      
      if (response.ok) {
        setKnowledgeBases(data.knowledgeBases);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKB = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/dashboard/knowledge-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        await fetchKnowledgeBases();
        setShowCreateModal(false);
      } else {
        const error = await response.json();
        alert(`Failed to create knowledge base: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
      alert('Failed to create knowledge base. Please try again.');
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Knowledge Bases
              </h1>
              <p className="text-xl text-zinc-400">
                Manage your AI-powered document libraries
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Knowledge Base
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <Database className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{stats.total}</h3>
            <p className="text-zinc-400">Total Knowledge Bases</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <Zap className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">{stats.active}</h3>
            <p className="text-zinc-400">Active</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <FileText className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-2xl font-bold text-purple-400 mb-2">{stats.totalDocuments}</h3>
            <p className="text-zinc-400">Total Documents</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <AlertCircle className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-2xl font-bold text-orange-400 mb-2">{(stats.totalTokens / 1000).toFixed(1)}K</h3>
            <p className="text-zinc-400">Total Tokens</p>
          </div>
        </motion.div>

        {/* Knowledge Bases List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-semibold">Your Knowledge Bases</h3>
          
          {knowledgeBases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBases.map((kb) => (
                <Link
                  key={kb.id}
                  href={`/dashboard/knowledge-bases/${kb.id}`}
                  className="block"
                >
                  <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 hover:border-emerald-500/50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <Database className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className={`px-3 py-1 rounded-lg text-xs ${
                        kb.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {kb.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                      {kb.name}
                    </h4>
                    
                    {kb.description && (
                      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                        {kb.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800">
                      <div>
                        <p className="text-xs text-zinc-500">Documents</p>
                        <p className="text-lg font-semibold">{kb.totalDocuments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Chunks</p>
                        <p className="text-lg font-semibold">{kb.totalChunks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Workflows</p>
                        <p className="text-lg font-semibold">{kb.workflowCount}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <Database className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">No Knowledge Bases Yet</h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Create your first knowledge base to start adding documents and powering your AI workflows with custom knowledge.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Knowledge Base
              </button>
            </div>
          )}
        </motion.div>

        {/* Create KB Modal */}
        {showCreateModal && (
          <CreateKBModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateKB}
          />
        )}
      </div>
    </div>
  );
}

// Create Knowledge Base Modal Component
function CreateKBModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a name');
      return;
    }

    setCreating(true);
    try {
      await onCreate(name, description);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-2xl w-full"
      >
        <h2 className="text-2xl font-bold mb-6">Create Knowledge Base</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none px-4 py-3 text-zinc-100"
              placeholder="e.g., Product Documentation, Customer Support, Technical Guides"
              maxLength={100}
              required
              disabled={creating}
            />
            <p className="text-xs text-zinc-500 mt-1">
              {name.length}/100 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none px-4 py-3 text-zinc-100 h-24 resize-none"
              placeholder="What kind of information will this knowledge base contain?"
              maxLength={500}
              disabled={creating}
            />
            <p className="text-xs text-zinc-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Knowledge Base
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

