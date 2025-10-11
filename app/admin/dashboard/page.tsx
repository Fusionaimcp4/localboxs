"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface DashboardStats {
  totalDemos: number;
  totalUsers: number;
  totalWorkflows: number;
  totalContacts: number;
  activeWorkflows: number;
}

interface Demo {
  id: string;
  slug: string;
  businessName: string;
  businessUrl: string;
  demoUrl: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDemos: 0,
    totalUsers: 0,
    totalWorkflows: 0,
    totalContacts: 0,
    activeWorkflows: 0,
  });
  const [recentDemos, setRecentDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
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
          <h1 className="text-4xl font-bold mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-zinc-400">
            Manage LocalBox system, users, and demos
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
        >
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-emerald-400 mb-2">{stats.totalDemos}</h3>
            <p className="text-zinc-400">Total Demos</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-2">{stats.totalUsers}</h3>
            <p className="text-zinc-400">Users</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-purple-400 mb-2">{stats.totalWorkflows}</h3>
            <p className="text-zinc-400">Workflows</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-orange-400 mb-2">{stats.totalContacts}</h3>
            <p className="text-zinc-400">Contacts</p>
          </div>
          <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-2xl font-bold text-green-400 mb-2">{stats.activeWorkflows}</h3>
            <p className="text-zinc-400">Active</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            href="/admin/onboard"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">Create Demo</h3>
            <p className="text-zinc-400 mb-6">
              Create a new AI support demo
            </p>
            <div className="text-emerald-400 font-medium">Create →</div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
            <p className="text-zinc-400 mb-6">
              View and manage user accounts
            </p>
            <div className="text-emerald-400 font-medium">Manage →</div>
          </Link>

          <Link
            href="/admin/system-messages"
            className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8 hover:border-zinc-700 transition-colors duration-200"
          >
            <h3 className="text-xl font-semibold mb-4">System Messages</h3>
            <p className="text-zinc-400 mb-6">
              Manage AI system messages
            </p>
            <div className="text-emerald-400 font-medium">Manage →</div>
          </Link>
        </motion.div>

        {/* Recent Demos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Recent Demos</h3>
            <Link
              href="/admin/demos"
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
                    <p className="text-sm text-zinc-400">{demo.user.name} • {demo.user.email}</p>
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
                    <Link
                      href={`/admin/demos/${demo.slug}`}
                      className="px-3 py-1 bg-zinc-700 text-zinc-300 rounded-lg text-sm hover:bg-zinc-600 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-zinc-400 text-center py-8">
                <p>No demos found.</p>
                <p className="text-sm mt-2">Create your first demo to get started!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
