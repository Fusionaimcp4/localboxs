"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FEATURE_MATRIX } from '@/lib/features';
import { SubscriptionTier } from '@/lib/generated/prisma';

interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  ctaHref: string;
}

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch('/api/pricing');
        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }
        const data = await response.json();
        setPricingPlans(data.pricingPlans);
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

  const formatPrice = (price: number, currency: string, period: string, tier: SubscriptionTier) => {
    if (tier === 'ENTERPRISE') {
      return null; // Don't show price for Enterprise
    }
    if (price === 0 && period === 'contact us') {
      return 'Custom';
    }
    if (price === 0) {
      return '$0';
    }
    return `$${price}`;
  };

  const getTierLimits = (tier: SubscriptionTier) => {
    return FEATURE_MATRIX[tier] || FEATURE_MATRIX.FREE;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include core features with no hidden fees.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-8 ${
                plan.isPopular 
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105' 
                  : 'border-slate-200 dark:border-slate-700 shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Tier Icon */}
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-2xl ${
                  plan.tier === 'FREE' ? 'bg-slate-100 dark:bg-slate-700' :
                  plan.tier === 'PRO' ? 'bg-blue-100 dark:bg-blue-900' :
                  plan.tier === 'PRO_PLUS' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900'
                }`}>
                  {plan.tier === 'FREE' ? (
                    <Zap className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Crown className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
              </div>

              {/* Tier Name & Price */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  {formatPrice(plan.price, plan.currency, plan.period, plan.tier) !== null ? (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                        {formatPrice(plan.price, plan.currency, plan.period, plan.tier)}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 ml-2">
                        {plan.period === 'forever' ? 'forever' : 
                         plan.period === 'contact us' ? 'contact us' : 
                         `per ${plan.period}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold text-slate-600 dark:text-slate-400">
                      Contact us for pricing
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-3 px-6 rounded-xl font-medium text-center transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We'll notify you when you're approaching your limits. You can upgrade to continue using the service.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, all paid plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
