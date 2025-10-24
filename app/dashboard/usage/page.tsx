"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { UsageDashboard } from "@/components/usage-dashboard";
import { ActivityLogs } from "@/components/activity-logs";
import ErrorBoundary from "@/components/error-boundary";
import ClientOnly from "@/components/client-only";

function UsagePageContent() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Usage & Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor your API usage, costs, and activity logs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <ClientOnly fallback={<div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />}>
            <UsageDashboard />
          </ClientOnly>
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <ClientOnly fallback={<div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />}>
            <ActivityLogs userId={session?.user?.id || ''} />
          </ClientOnly>
        </motion.div>
      </div>
    </div>
  );
}

export default function UsagePage() {
  return (
    <ErrorBoundary>
      <UsagePageContent />
    </ErrorBoundary>
  );
}
