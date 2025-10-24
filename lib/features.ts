import { SubscriptionTier } from '@/lib/generated/prisma';

// Tier limits configuration
export interface TierLimits {
  maxDemos: number;
  maxWorkflows: number;
  maxKnowledgeBases: number;
  maxDocuments: number;
  maxIntegrations: number;
  apiCallsPerMonth: number;
  documentSizeLimit: number;
  chunkSize: number;
  maxChunksPerDocument: number;
}

// Default tier limits
const DEFAULT_TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    maxDemos: 1,
    maxWorkflows: 2,
    maxKnowledgeBases: 1,
    maxDocuments: 10,
    maxIntegrations: 1,
    apiCallsPerMonth: 1000,
    documentSizeLimit: 5 * 1024 * 1024, // 5MB
    chunkSize: 1000,
    maxChunksPerDocument: 50
  },
  PRO: {
    maxDemos: 5,
    maxWorkflows: 10,
    maxKnowledgeBases: 5,
    maxDocuments: 100,
    maxIntegrations: 3,
    apiCallsPerMonth: 10000,
    documentSizeLimit: 25 * 1024 * 1024, // 25MB
    chunkSize: 2000,
    maxChunksPerDocument: 200
  },
  PRO_PLUS: {
    maxDemos: 25,
    maxWorkflows: 50,
    maxKnowledgeBases: 25,
    maxDocuments: 1000,
    maxIntegrations: 10,
    apiCallsPerMonth: 100000,
    documentSizeLimit: 100 * 1024 * 1024, // 100MB
    chunkSize: 4000,
    maxChunksPerDocument: 1000
  },
  ENTERPRISE: {
    maxDemos: -1, // Unlimited
    maxWorkflows: -1,
    maxKnowledgeBases: -1,
    maxDocuments: -1,
    maxIntegrations: -1,
    apiCallsPerMonth: -1,
    documentSizeLimit: 500 * 1024 * 1024, // 500MB
    chunkSize: 8000,
    maxChunksPerDocument: -1
  }
};

// Get tier limits for a subscription tier
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return DEFAULT_TIER_LIMITS[tier] || DEFAULT_TIER_LIMITS.FREE;
}

// Check if user can access a feature based on tier
export function canAccessFeature(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierOrder = ['FREE', 'PRO', 'PRO_PLUS', 'ENTERPRISE'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}

// Get all available features for a tier
export function getAvailableFeatures(tier: SubscriptionTier): string[] {
  const features = {
    FREE: [
      'Basic dashboard',
      'Create demos (1)',
      'Create workflows (2)',
      'Create knowledge bases (1)',
      'Upload documents (10)',
      'Basic integrations (1)'
    ],
    PRO: [
      'All FREE features',
      'Create demos (5)',
      'Create workflows (10)',
      'Create knowledge bases (5)',
      'Upload documents (100)',
      'Advanced integrations (3)',
      'Analytics dashboard',
      'Custom branding',
      'API keys'
    ],
    PRO_PLUS: [
      'All PRO features',
      'Create demos (25)',
      'Create workflows (50)',
      'Create knowledge bases (25)',
      'Upload documents (1000)',
      'Advanced integrations (10)',
      'White-label solution',
      'SSO integration',
      'Webhooks'
    ],
    ENTERPRISE: [
      'All PRO_PLUS features',
      'Unlimited demos',
      'Unlimited workflows',
      'Unlimited knowledge bases',
      'Unlimited documents',
      'Unlimited integrations',
      'Priority support',
      'Custom integrations',
      'Dedicated infrastructure'
    ]
  };

  return features[tier] || features.FREE;
}

// Check if a feature is available for a tier
export function isFeatureAvailable(tier: SubscriptionTier, feature: string): boolean {
  const availableFeatures = getAvailableFeatures(tier);
  return availableFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}

// Get upgrade suggestions for a tier
export function getUpgradeSuggestions(currentTier: SubscriptionTier): {
  nextTier: SubscriptionTier | null;
  benefits: string[];
} {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PRO', 'PRO_PLUS', 'ENTERPRISE'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex >= tierOrder.length - 1) {
    return { nextTier: null, benefits: [] };
  }
  
  const nextTier = tierOrder[currentIndex + 1];
  const currentFeatures = getAvailableFeatures(currentTier);
  const nextFeatures = getAvailableFeatures(nextTier);
  
  const benefits = nextFeatures.filter(feature => !currentFeatures.includes(feature));
  
  return { nextTier, benefits };
}