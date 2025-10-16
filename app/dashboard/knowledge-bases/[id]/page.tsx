"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, Upload, FileText, Trash2, 
  Settings, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw,
  Link as LinkIcon, Plus, Edit2, Zap
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingError?: string | null;
  wordCount?: number | null;
  createdAt: string;
  _count: {
    chunks: number;
  };
}

interface WorkflowLink {
  id: string;
  workflowId: string;
  priority: number;
  retrievalLimit: number;
  similarityThreshold: number;
  isActive: boolean;
  workflow: {
    id: string;
    n8nWorkflowId: string | null;
    status: string;
    demo: {
      businessName: string;
      slug: string;
    };
  };
}

interface Workflow {
  id: string;
  n8nWorkflowId: string | null;
  status: string;
  demo: {
    id: string;
    businessName: string;
    slug: string;
  };
}

interface KnowledgeBaseDetail {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  totalDocuments: number;
  totalChunks: number;
  totalTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
}

export default function KnowledgeBaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [kb, setKb] = useState<KnowledgeBaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [workflowLinks, setWorkflowLinks] = useState<WorkflowLink[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({
    workflowId: '',
    priority: 1,
    retrievalLimit: 5,
    similarityThreshold: 0.4,
  });

  useEffect(() => {
    fetchKB();
  }, [resolvedParams.id]);

  useEffect(() => {
    // Auto-refresh only while documents are processing
    if (!kb?.documents) return;
    
    const hasProcessingDocs = kb.documents.some(
      doc => doc.status === 'PENDING' || doc.status === 'PROCESSING'
    );
    
    if (!hasProcessingDocs) return;
    
    const interval = setInterval(() => {
      fetchKB();
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, [kb?.documents]);

  const fetchKB = async () => {
    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Received non-JSON response:', await response.text());
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.knowledgeBase) {
        setKb(data.knowledgeBase);
        setSettingsForm({
          name: data.knowledgeBase.name,
          description: data.knowledgeBase.description || '',
          isActive: data.knowledgeBase.isActive,
        });
      }
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchKB();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'PROCESSING': return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingDocId(docId);
    try {
      const response = await fetch(`/api/dashboard/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchKB();
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleReprocessDocument = async (docId: string) => {
    if (!confirm('Reprocess this document? This will regenerate chunks and embeddings.')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/documents/${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprocess' }),
      });

      if (response.ok) {
        alert('Document reprocessing started');
        await fetchKB();
      } else {
        const error = await response.json();
        alert(`Reprocess failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Reprocess failed:', error);
      alert('Reprocess failed. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (response.ok) {
        alert('Settings saved successfully');
        setShowSettings(false);
        await fetchKB();
      } else {
        const error = await response.json();
        alert(`Save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Save settings failed:', error);
      alert('Save failed. Please try again.');
    }
  };

  const handleDeleteKB = async () => {
    if (!confirm('Are you sure you want to delete this knowledge base? This will delete all documents and cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/dashboard/knowledge-bases';
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  // Workflow link management
  const fetchWorkflowLinks = async () => {
    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}/workflow-links`);
      if (response.ok) {
        const data = await response.json();
        setWorkflowLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflow links:', error);
    }
  };

  const fetchAvailableWorkflows = async () => {
    try {
      const response = await fetch('/api/dashboard/workflows');
      if (response.ok) {
        const data = await response.json();
        setAvailableWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const handleOpenLinkModal = () => {
    fetchAvailableWorkflows();
    setShowLinkModal(true);
  };

  const handleLinkWorkflow = async () => {
    if (!linkForm.workflowId) {
      alert('Please select a workflow');
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}/link-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm),
      });

      if (response.ok) {
        alert('Workflow linked successfully!');
        setShowLinkModal(false);
        setLinkForm({
          workflowId: '',
          priority: 1,
          retrievalLimit: 5,
          similarityThreshold: 0.4,
        });
        await fetchWorkflowLinks();
      } else {
        const error = await response.json();
        alert(`Link failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Link failed:', error);
      alert('Link failed. Please try again.');
    }
  };

  const handleUnlinkWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to unlink this workflow?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/dashboard/knowledge-bases/${resolvedParams.id}/unlink-workflow?workflowId=${workflowId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Workflow unlinked successfully!');
        await fetchWorkflowLinks();
      } else {
        const error = await response.json();
        alert(`Unlink failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Unlink failed:', error);
      alert('Unlink failed. Please try again.');
    }
  };

  const handleToggleLinkActive = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/knowledge-bases/${resolvedParams.id}/workflow-links`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, isActive: !isActive }),
      });

      if (response.ok) {
        await fetchWorkflowLinks();
      } else {
        const error = await response.json();
        alert(`Update failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try again.');
    }
  };

  // Fetch workflow links on mount
  useEffect(() => {
    if (kb) {
      fetchWorkflowLinks();
    }
  }, [kb]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!kb) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Knowledge Base Not Found</h2>
          <Link href="/dashboard/knowledge-bases" className="text-emerald-400 hover:underline">
            ← Back to Knowledge Bases
          </Link>
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
          <Link
            href="/dashboard/knowledge-bases"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Knowledge Bases
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{kb.name}</h1>
              {kb.description && (
                <p className="text-xl text-zinc-400">{kb.description}</p>
              )}
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <p className="text-zinc-400 text-sm mb-1">Documents</p>
            <p className="text-3xl font-bold">{kb.totalDocuments}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <p className="text-zinc-400 text-sm mb-1">Chunks</p>
            <p className="text-3xl font-bold">{kb.totalChunks}</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <p className="text-zinc-400 text-sm mb-1">Tokens</p>
            <p className="text-3xl font-bold">{(kb.totalTokens / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <p className="text-zinc-400 text-sm mb-1">Status</p>
            <p className={`text-lg font-semibold ${kb.isActive ? 'text-green-400' : 'text-zinc-400'}`}>
              {kb.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-semibold mb-6">Upload Documents</h3>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-500/10' 
                : 'border-zinc-700 bg-zinc-900/40'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500/50'}`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <h4 className="text-lg font-semibold mb-2">
              {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </h4>
            <p className="text-zinc-400 mb-4">
              Supported formats: PDF, DOCX, TXT, MD, CSV, JSON (max 10MB)
            </p>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv,.json"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors inline-block cursor-pointer"
            >
              Select File
            </label>
          </div>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h3 className="text-2xl font-semibold mb-6">Documents ({kb.documents.length})</h3>
          
          {kb.documents.length > 0 ? (
            <div className="space-y-3">
              {kb.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <FileText className="w-8 h-8 text-emerald-400" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{doc.originalName}</h4>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>{doc.fileType.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{doc._count.chunks} chunks</span>
                          {doc.wordCount && (
                            <>
                              <span>•</span>
                              <span>{doc.wordCount.toLocaleString()} words</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm">{doc.status}</span>
                      </div>
                      {(doc.status === 'COMPLETED' || doc.status === 'FAILED') && (
                        <button 
                          onClick={() => handleReprocessDocument(doc.id)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group"
                          title="Reprocess document"
                        >
                          <RefreshCw className="w-5 h-5 text-zinc-400 group-hover:text-blue-400" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group disabled:opacity-50"
                        title="Delete document"
                      >
                        <Trash2 className={`w-5 h-5 text-zinc-400 group-hover:text-red-400 ${deletingDocId === doc.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </div>
                  {doc.processingError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      Error: {doc.processingError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-12 text-center">
              <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No documents yet. Upload your first document to get started.</p>
            </div>
          )}
        </motion.div>

        {/* Workflow Assignment Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Linked Workflows ({workflowLinks.length})</h3>
            <button
              onClick={handleOpenLinkModal}
              className="px-4 py-2 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Link Workflow
            </button>
          </div>

          {workflowLinks.length > 0 ? (
            <div className="space-y-3">
              {workflowLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${link.isActive ? 'bg-green-400' : 'bg-zinc-600'}`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{link.workflow.demo.businessName}</h4>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Priority: {link.priority}
                          </span>
                          <span>•</span>
                          <span>Limit: {link.retrievalLimit} chunks</span>
                          <span>•</span>
                          <span>Threshold: {link.similarityThreshold}</span>
                          {link.workflow.n8nWorkflowId && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">workflow: {link.workflow.n8nWorkflowId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleLinkActive(link.id, link.isActive)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          link.isActive
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                        }`}
                      >
                        {link.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleUnlinkWorkflow(link.workflowId)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
                        title="Unlink workflow"
                      >
                        <Trash2 className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-12 text-center">
              <LinkIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">No workflows linked yet.</p>
              <p className="text-sm text-zinc-500">Link this knowledge base to a workflow to make it available for RAG.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Link Workflow Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl border border-zinc-800 max-w-2xl w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Link Workflow</h2>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Workflow Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Workflow</label>
                <select
                  value={linkForm.workflowId}
                  onChange={(e) => setLinkForm({ ...linkForm, workflowId: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Choose a workflow...</option>
                  {availableWorkflows
                    .filter(wf => !workflowLinks.some(link => link.workflowId === wf.id))
                    .map(workflow => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.demo.businessName} {workflow.n8nWorkflowId ? `(workflow: ${workflow.n8nWorkflowId})` : ''}
                      </option>
                    ))
                  }
                </select>
                <p className="text-sm text-zinc-400 mt-2">
                  {availableWorkflows.length === 0 ? 'No workflows available' : `${availableWorkflows.filter(wf => !workflowLinks.some(link => link.workflowId === wf.id)).length} workflows available`}
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                  <span className="text-zinc-400 font-normal ml-2">(lower = higher priority)</span>
                </label>
                <input
                  type="number"
                  value={linkForm.priority}
                  onChange={(e) => setLinkForm({ ...linkForm, priority: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Retrieval Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Retrieval Limit
                  <span className="text-zinc-400 font-normal ml-2">(max chunks to return)</span>
                </label>
                <input
                  type="number"
                  value={linkForm.retrievalLimit}
                  onChange={(e) => setLinkForm({ ...linkForm, retrievalLimit: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Similarity Threshold */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Similarity Threshold
                  <span className="text-zinc-400 font-normal ml-2">(0.3 = loose, 0.7 = strict)</span>
                </label>
                <input
                  type="number"
                  value={linkForm.similarityThreshold}
                  onChange={(e) => setLinkForm({ ...linkForm, similarityThreshold: parseFloat(e.target.value) || 0.4 })}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Loose (more results)</span>
                  <span>Strict (fewer, more relevant)</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">About these settings:</p>
                    <ul className="space-y-1 text-blue-200/80">
                      <li>• <strong>Priority:</strong> When multiple KBs are linked, lower numbers are searched first</li>
                      <li>• <strong>Limit:</strong> Maximum number of relevant chunks to return to the AI</li>
                      <li>• <strong>Threshold:</strong> Minimum similarity score (0.4-0.5 recommended)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkWorkflow}
                disabled={!linkForm.workflowId}
                className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Link Workflow
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl border border-zinc-800 max-w-2xl w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Knowledge Base Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="My Knowledge Base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Describe this knowledge base..."
                  rows={3}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-2xl">
                <div>
                  <p className="font-medium">Active Status</p>
                  <p className="text-sm text-zinc-400">Enable or disable this knowledge base</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={settingsForm.isActive}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>

              {/* Stats (Read-only) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-800 rounded-2xl">
                  <p className="text-sm text-zinc-400 mb-1">Documents</p>
                  <p className="text-2xl font-bold">{kb?.totalDocuments || 0}</p>
                </div>
                <div className="p-4 bg-zinc-800 rounded-2xl">
                  <p className="text-sm text-zinc-400 mb-1">Chunks</p>
                  <p className="text-2xl font-bold">{kb?.totalChunks || 0}</p>
                </div>
                <div className="p-4 bg-zinc-800 rounded-2xl">
                  <p className="text-sm text-zinc-400 mb-1">Tokens</p>
                  <p className="text-2xl font-bold">{((kb?.totalTokens || 0) / 1000).toFixed(1)}K</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-semibold mb-3 text-red-400">Danger Zone</h3>
                <button
                  onClick={handleDeleteKB}
                  className="w-full px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-colors"
                >
                  Delete Knowledge Base
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

