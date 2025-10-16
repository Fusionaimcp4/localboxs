"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SystemMessage {
  id: string;
  demoId: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  demo: {
    businessName: string;
    slug: string;
  };
}

export default function SystemMessagesPage() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SystemMessage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemMessages();
  }, []);

  const fetchSystemMessages = async () => {
    try {
      const response = await fetch('/api/dashboard/system-messages');
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch system messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: SystemMessage) => {
    setSelectedMessage(message);
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setIsEditing(false);
    setEditContent('');
  };

  const handleEditMessage = () => {
    setIsEditing(true);
  };

  const handleSaveMessage = async () => {
    if (!selectedMessage) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/system-messages/${selectedMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          content: editContent
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update the message in the local state
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, content: editContent, version: msg.version + 1, updatedAt: new Date().toISOString() }
            : msg
        ));
        
        // Update the selected message
        setSelectedMessage(prev => prev ? { ...prev, content: editContent, version: prev.version + 1, updatedAt: new Date().toISOString() } : null);
        
        setIsEditing(false);
        alert('System message updated successfully!');
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save message:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(selectedMessage?.content || '');
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
                System Messages
              </h1>
              <p className="text-xl text-zinc-400">
                Manage your AI system message templates
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/knowledge-bases"
                className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Knowledge Base
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

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{message.demo.businessName}</h3>
                    <p className="text-sm text-zinc-400">Version {message.version}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm ${
                      message.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {message.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleViewMessage(message)}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      View Content
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-zinc-500 mb-4">
                  Created: {new Date(message.createdAt).toLocaleDateString()} • 
                  Updated: {new Date(message.updatedAt).toLocaleDateString()}
                </div>
                
                <div className="text-zinc-300 text-sm">
                  {message.content.substring(0, 200)}...
                </div>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center">
              <h3 className="text-xl font-semibold mb-4">No System Messages</h3>
              <p className="text-zinc-400 mb-6">
                You haven't created any demos yet. System messages are generated automatically when you create demos.
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

               {/* Modal for viewing/editing message content */}
               {selectedMessage && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
                   <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <h2 className="text-2xl font-bold">{selectedMessage.demo.businessName}</h2>
                         <p className="text-sm text-zinc-400">Version {selectedMessage.version}</p>
                       </div>
                       <div className="flex gap-3">
                         {!isEditing && (
                           <Link
                             href="/dashboard/knowledge-bases"
                             className="px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                             </svg>
                             Manage Knowledge Base
                           </Link>
                         )}
                         {!isEditing ? (
                           <button
                             onClick={handleEditMessage}
                             className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors"
                           >
                             Edit Message
                           </button>
                         ) : (
                           <>
                             <button
                               onClick={handleSaveMessage}
                               disabled={saving}
                               className="px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               {saving ? 'Saving...' : 'Save Changes'}
                             </button>
                             <button
                               onClick={handleCancelEdit}
                               className="px-6 py-3 bg-zinc-700 text-zinc-300 rounded-2xl hover:bg-zinc-600 transition-colors"
                             >
                               Cancel
                             </button>
                           </>
                         )}
                         <button
                           onClick={handleCloseModal}
                           className="text-zinc-400 hover:text-zinc-300 text-2xl"
                         >
                           ×
                         </button>
                       </div>
                     </div>
                     
                     <div className="bg-zinc-800/50 rounded-2xl p-6">
                       {isEditing ? (
                         <textarea
                           value={editContent}
                           onChange={(e) => setEditContent(e.target.value)}
                           className="w-full h-96 bg-zinc-900 text-zinc-300 p-4 rounded-lg border border-zinc-700 focus:border-emerald-500 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                           placeholder="Enter system message content..."
                         />
                       ) : (
                         <pre className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                           {selectedMessage.content}
                         </pre>
                       )}
                     </div>
                   </div>
                 </div>
               )}
      </div>
    </div>
  );
}
