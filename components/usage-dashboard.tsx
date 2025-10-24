"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Crown,
  ArrowUp,
  Zap,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { SubscriptionTier } from '@/lib/generated/prisma';
import { getTierLimits, getUsagePercentage, getUsageStatus } from '@/lib/features';
import { UsageStats } from '@/lib/tier-access';
import { TierBadge, UsageLimit } from '@/components/feature-gate';

interface UsageDashboardProps {
  className?: string;
}

export function UsageDashboard({ className = '' }: UsageDashboardProps) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const userTier = (session?.user?.subscriptionTier as SubscriptionTier) || 'FREE';
  const limits = getTierLimits(userTier);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/dashboard/usage');
        if (response.ok) {
          const data = await response.json();
          setUsage(data.usage);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="text-center text-slate-500 dark:text-slate-400">
          Unable to load usage data
        </div>
      </div>
    );
  }

  const usageItems = [
    {
      label: 'Demos',
      current: usage.demos,
      limit: limits.maxDemos,
      icon: BarChart3
    },
    {
      label: 'Workflows',
      current: usage.workflows,
      limit: limits.maxWorkflows,
      icon: TrendingUp
    },
    {
      label: 'Knowledge Bases',
      current: usage.knowledgeBases,
      limit: limits.maxKnowledgeBases,
      icon: BarChart3
    },
    {
      label: 'Documents',
      current: usage.documents,
      limit: limits.maxDocuments,
      icon: BarChart3
    },
    {
      label: 'Integrations',
      current: usage.integrations,
      limit: limits.maxIntegrations,
      icon: BarChart3
    },
    {
      label: 'API Calls',
      current: usage.apiCalls,
      limit: limits.apiCallsPerMonth,
      icon: Zap
    }
  ];

  const hasWarnings = usageItems.some(item => {
    const percentage = getUsagePercentage(item.current, item.limit);
    return percentage >= 75;
  });

  const hasCritical = usageItems.some(item => {
    const percentage = getUsagePercentage(item.current, item.limit);
    return percentage >= 90;
  });

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Usage Overview
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <TierBadge tier={userTier} />
              {hasCritical && (
                <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Limits Exceeded
                </span>
              )}
              {hasWarnings && !hasCritical && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Approaching Limits
                </span>
              )}
              {!hasWarnings && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  All Good
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Usage
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Usage
              </>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {userTier !== 'ENTERPRISE' && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Usage Items */}
            <div className="space-y-4">
              {usageItems.map((item, index) => {
                const Icon = item.icon;
                const percentage = getUsagePercentage(item.current, item.limit);
                const status = getUsageStatus(item.current, item.limit);
                
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <UsageLimit
                      current={item.current}
                      limit={item.limit}
                      label={item.label}
                      className=""
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Upgrade Prompt */}
            {hasWarnings && userTier !== 'ENTERPRISE' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {hasCritical ? 'Limits Exceeded' : 'Approaching Limits'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {hasCritical 
                        ? 'You have exceeded your current plan limits. Upgrade to continue using the service.'
                        : 'You are approaching your current plan limits. Consider upgrading to avoid interruptions.'
                      }
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Crown className="w-4 h-4" />
                      View Plans
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tier Benefits */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {userTier} Plan Benefits
              </h4>
              <div className="space-y-2">
                {limits.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
