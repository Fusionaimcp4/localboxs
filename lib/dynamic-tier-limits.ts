import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@/lib/generated/prisma';

export interface DynamicTierLimits {
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

// Cache for tier limits to avoid database calls on every request
const tierLimitsCache = new Map<SubscriptionTier, DynamicTierLimits>();
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get tier limits from database (with caching)
export async function getDynamicTierLimits(tier: SubscriptionTier): Promise<DynamicTierLimits> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (now < cacheExpiry && tierLimitsCache.has(tier)) {
    return tierLimitsCache.get(tier)!;
  }

  try {
    const tierLimit = await prisma.tierLimit.findUnique({
      where: { tier }
    });

    if (!tierLimit) {
      // Fallback to default limits if not configured
      return getDefaultTierLimits(tier);
    }

    const limits: DynamicTierLimits = {
      maxDemos: tierLimit.maxDemos,
      maxWorkflows: tierLimit.maxWorkflows,
      maxKnowledgeBases: tierLimit.maxKnowledgeBases,
      maxDocuments: tierLimit.maxDocuments,
      maxIntegrations: tierLimit.maxIntegrations,
      apiCallsPerMonth: tierLimit.apiCallsPerMonth,
      documentSizeLimit: tierLimit.documentSizeLimit,
      chunkSize: tierLimit.chunkSize,
      maxChunksPerDocument: tierLimit.maxChunksPerDocument,
    };

    // Cache the result
    tierLimitsCache.set(tier, limits);
    cacheExpiry = now + CACHE_TTL;

    return limits;
  } catch (error) {
    console.error('Failed to fetch dynamic tier limits:', error);
    return getDefaultTierLimits(tier);
  }
}

// Default tier limits (fallback)
function getDefaultTierLimits(tier: SubscriptionTier): DynamicTierLimits {
  const defaults = {
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

  return defaults[tier] || defaults.FREE;
}

// Clear cache (call this when limits are updated)
export function clearTierLimitsCache(): void {
  tierLimitsCache.clear();
  cacheExpiry = 0;
}

// Update tier limits (admin function)
export async function updateTierLimits(
  tier: SubscriptionTier, 
  limits: Partial<DynamicTierLimits>
): Promise<void> {
  await prisma.tierLimit.upsert({
    where: { tier },
    update: {
      ...limits,
      updatedAt: new Date(),
    },
    create: {
      tier,
      maxDemos: limits.maxDemos || 0,
      maxWorkflows: limits.maxWorkflows || 0,
      maxKnowledgeBases: limits.maxKnowledgeBases || 0,
      maxDocuments: limits.maxDocuments || 0,
      maxIntegrations: limits.maxIntegrations || 0,
      apiCallsPerMonth: limits.apiCallsPerMonth || 0,
      documentSizeLimit: limits.documentSizeLimit || 0,
      chunkSize: limits.chunkSize || 1000,
      maxChunksPerDocument: limits.maxChunksPerDocument || 0,
    },
  });

  // Clear cache to force refresh
  clearTierLimitsCache();
}

// Get all tier limits (admin function)
export async function getAllTierLimits(): Promise<Record<SubscriptionTier, DynamicTierLimits>> {
  const tierLimits = await prisma.tierLimit.findMany({
    orderBy: { tier: 'asc' }
  });

  const result: Record<SubscriptionTier, DynamicTierLimits> = {} as any;

  // Get limits for all tiers (including those not in database)
  const allTiers: SubscriptionTier[] = ['FREE', 'PRO', 'PRO_PLUS', 'ENTERPRISE'];
  
  for (const tier of allTiers) {
    const dbLimit = tierLimits.find(tl => tl.tier === tier);
    
    if (dbLimit) {
      result[tier] = {
        maxDemos: dbLimit.maxDemos,
        maxWorkflows: dbLimit.maxWorkflows,
        maxKnowledgeBases: dbLimit.maxKnowledgeBases,
        maxDocuments: dbLimit.maxDocuments,
        maxIntegrations: dbLimit.maxIntegrations,
        apiCallsPerMonth: dbLimit.apiCallsPerMonth,
        documentSizeLimit: dbLimit.documentSizeLimit,
        chunkSize: dbLimit.chunkSize,
        maxChunksPerDocument: dbLimit.maxChunksPerDocument,
      };
    } else {
      result[tier] = getDefaultTierLimits(tier);
    }
  }

  return result;
}
