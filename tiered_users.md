## **1. Database Schema Changes**

### **Extend User Model:**
```prisma
model User {
  // Existing fields...
  role               UserRole @default(USER)
  subscriptionTier   SubscriptionTier @default(FREE)  // NEW
  subscriptionStatus SubscriptionStatus @default(ACTIVE)  // NEW
  subscriptionExpiresAt DateTime?  // NEW
  features           UserFeature[]  // NEW - Many-to-many relationship
}

enum SubscriptionTier {
  FREE
  PRO
  PRO_PLUS
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  SUSPENDED
}

model UserFeature {
  id        String @id @default(cuid())
  userId    String
  featureId String
  user      User @relation(fields: [userId], references: [id])
  feature   Feature @relation(fields: [featureId], references: [id])
  
  @@unique([userId, featureId])
}

model Feature {
  id          String @id @default(cuid())
  name        String @unique
  description String
  tier        SubscriptionTier
  isActive    Boolean @default(true)
  users       UserFeature[]
}
```

## **2. Feature Definition Strategy**

### **Create Feature Matrix:**
```typescript
const FEATURE_MATRIX = {
  FREE: {
    maxDemos: 1,
    maxWorkflows: 2,
    maxKnowledgeBases: 1,
    maxDocuments: 10,
    integrations: ['CRM'],
    supportLevel: 'community',
    apiCallsPerMonth: 1000
  },
  PRO: {
    maxDemos: 5,
    maxWorkflows: 10,
    maxKnowledgeBases: 5,
    maxDocuments: 100,
    integrations: ['CRM', 'Calendar', 'Database'],
    supportLevel: 'email',
    apiCallsPerMonth: 10000,
    features: ['advanced_analytics', 'custom_branding']
  },
  PRO_PLUS: {
    maxDemos: 25,
    maxWorkflows: 50,
    maxKnowledgeBases: 25,
    maxDocuments: 1000,
    integrations: ['CRM', 'Calendar', 'Database', 'API', 'Webhook'],
    supportLevel: 'priority',
    apiCallsPerMonth: 100000,
    features: ['advanced_analytics', 'custom_branding', 'white_label', 'sso']
  }
}
```

## **3. Access Control Architecture**

### **Middleware Enhancement:**
- **Route-level protection** based on subscription tier
- **Feature flag checking** before rendering components
- **API rate limiting** based on tier limits
- **Graceful degradation** for expired subscriptions

### **Component-level Guards:**
```typescript
// Example usage
<FeatureGate feature="advanced_analytics" tier="PRO">
  <AdvancedAnalytics />
</FeatureGate>

<FeatureGate feature="white_label" tier="PRO_PLUS">
  <WhiteLabelSettings />
</FeatureGate>
```

## **4. Implementation Layers**

### **A. Authentication & Session Updates:**
- Extend NextAuth session to include `subscriptionTier`
- Update JWT tokens with tier information
- Modify middleware to check tier-based access

### **B. API Route Protection:**
- **Tier-based rate limiting** (different limits per tier)
- **Feature availability checks** before processing requests
- **Usage tracking** (API calls, document uploads, etc.)
- **Graceful error responses** for tier limitations

### **C. Frontend Feature Gates:**
- **Conditional rendering** based on user tier
- **Upgrade prompts** when users hit limits
- **Feature comparison tables** in pricing pages
- **Usage dashboards** showing current limits vs. usage

## **5. User Experience Strategy**

### **A. Upgrade Flow:**
- **In-app upgrade prompts** when limits are reached
- **Feature previews** with "Upgrade to unlock" CTAs
- **Usage warnings** before hitting limits
- **Seamless payment integration** (Stripe, etc.)

### **B. Graceful Degradation:**
- **Feature hiding** rather than error throwing
- **Helpful messaging** explaining tier limitations
- **Clear upgrade paths** with pricing information
- **Trial periods** for premium features

## **6. Technical Implementation Approach**

### **Phase 1: Foundation**
1. **Database migration** for subscription fields
2. **Feature definition system** with tier mapping
3. **Basic middleware** for tier checking
4. **Session updates** to include tier information

### **Phase 2: Access Control**
1. **API route protection** with tier-based limits
2. **Component-level feature gates**
3. **Usage tracking and enforcement**
4. **Error handling** for tier violations

### **Phase 3: User Experience**
1. **Upgrade prompts and CTAs**
2. **Usage dashboards and limits display**
3. **Feature comparison and pricing pages**
4. **Payment integration and subscription management**

### **Phase 4: Advanced Features**
1. **Usage analytics and reporting**
2. **Automated tier enforcement**
3. **Subscription lifecycle management**
4. **Enterprise features and custom tiers**

## **7. Key Considerations**

### **A. Migration Strategy:**
- **Existing users** default to FREE tier
- **Grandfathering options** for current users
- **Data preservation** during tier changes
- **Backward compatibility** during transition

### **B. Performance:**
- **Caching** tier information in sessions
- **Efficient database queries** for feature checks
- **Minimal overhead** for tier validation
- **CDN-friendly** feature flag distribution

### **C. Security:**
- **Server-side validation** of all tier checks
- **Tamper-proof** tier information
- **Audit logging** for tier changes
- **Secure payment processing**

## **8. Monitoring & Analytics**

### **A. Usage Tracking:**
- **Feature usage metrics** per tier
- **Limit hit rates** and upgrade conversion
- **User behavior patterns** across tiers
- **Revenue attribution** to features

### **B. Business Intelligence:**
- **Tier upgrade funnels**
- **Feature adoption rates**
- **Churn analysis** by tier
- **Pricing optimization** data
