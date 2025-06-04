# Database Schema Updates - Marketing Metrics & User Terminology

## Overview

This document outlines the comprehensive database schema updates implemented to support marketing metrics, user-level analytics, and terminology changes from "client" to "user".

## Schema Changes

### 1. New Tables Added

#### `marketing_metrics` Table
Stores comprehensive marketing analytics for each user/configuration:

```sql
CREATE TABLE marketing_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    configuration_id UUID REFERENCES configurations(id),
    monthly_marketing_spend DECIMAL(10,2) DEFAULT 0,
    cac DECIMAL(10,2) DEFAULT 0,
    ltv DECIMAL(10,2) DEFAULT 0,
    ltv_cac_ratio DECIMAL(5,2) DEFAULT 0,
    payback_period_months DECIMAL(5,2) DEFAULT 0,
    organic_growth_rate DECIMAL(5,4) DEFAULT 0,
    paid_growth_rate DECIMAL(5,4) DEFAULT 0,
    brand_awareness_spend DECIMAL(10,2) DEFAULT 0,
    performance_marketing_spend DECIMAL(10,2) DEFAULT 0,
    content_marketing_spend DECIMAL(10,2) DEFAULT 0,
    affiliate_marketing_spend DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    lead_quality_score INTEGER DEFAULT 0,
    marketing_roi DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Purpose**: Track all marketing-related metrics including CAC, LTV, marketing spend allocation, and channel performance.

#### `user_analytics` Table
Stores user-level analytics and metrics:

```sql
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    configuration_id UUID REFERENCES configurations(id),
    avg_users_per_client DECIMAL(5,2) DEFAULT 1,
    user_growth_rate DECIMAL(5,4) DEFAULT 0,
    user_churn_rate DECIMAL(5,4) DEFAULT 0,
    arpu DECIMAL(10,2) DEFAULT 0,
    revenue_per_user DECIMAL(10,2) DEFAULT 0,
    user_retention_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Purpose**: Track user-level metrics including ARPU, user growth rates, retention, and churn analytics.

### 2. Configuration Updates

#### JSON Structure Changes in `configurations.config`

**Removed Fields:**
- `openAiCostPerClient` - Eliminated AI cost tracking
- `pricePerClient` - Renamed to `pricePerUser`
- `initialClients` - Renamed to `initialUsers`

**Added Fields:**
- `pricePerUser` - Monthly price per user
- `initialUsers` - Starting number of users
- `monthlyFixedCosts.marketing` - Marketing spend component
- `avgUsersPerClient` - Average users per client/tenant
- `userGrowthRate` - User-level growth rate
- `userChurnRate` - User-level churn rate
- `marketingMetrics` - Complete marketing analytics object

**New Marketing Metrics Object:**
```json
{
  "marketingMetrics": {
    "monthlyMarketingSpend": 2000,
    "cac": 150,
    "ltv": 800,
    "ltvCacRatio": 5.3,
    "paybackPeriodMonths": 6,
    "organicGrowthRate": 0.25,
    "paidGrowthRate": 0.75,
    "brandAwarenessSpend": 400,
    "performanceMarketingSpend": 1200,
    "contentMarketingSpend": 300,
    "affiliateMarketingSpend": 100,
    "conversionRate": 0.12,
    "leadQualityScore": 70,
    "marketingROI": 4.0
  }
}
```

### 3. Updated Feature Add-ons

**New Marketing-Focused Add-ons:**
- `Marketing Intelligence` - Advanced marketing analytics and CAC/LTV tracking ($79/month)
- `User Segmentation` - Advanced user cohort analysis and segmentation ($59/user)

**Updated Descriptions:**
All existing add-ons updated to use "user" terminology instead of "client".

### 4. Indexes Added

```sql
CREATE INDEX idx_marketing_metrics_user_id ON marketing_metrics(user_id);
CREATE INDEX idx_marketing_metrics_config_id ON marketing_metrics(configuration_id);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_config_id ON user_analytics(configuration_id);
```

## Migration Process

### Automatic Migration (Migration 003)

The migration script automatically:

1. **Creates new tables** with proper structure and indexes
2. **Updates existing configurations**:
   - Removes `openAiCostPerClient`
   - Renames `pricePerClient` → `pricePerUser`
   - Renames `initialClients` → `initialUsers`
   - Adds `marketing` to `monthlyFixedCosts`
   - Adds complete `marketingMetrics` object
   - Adds user analytics fields

3. **Populates default data**:
   - Marketing metrics for all existing users
   - User analytics for all existing users
   - New marketing-focused feature add-ons

4. **Updates terminology**:
   - All descriptions changed from "client" to "user"
   - Growth scenarios updated
   - Feature add-ons updated

### Running the Migration

```bash
# Run the migration
npm run migrate:marketing

# Rollback if needed
npm run migrate:rollback
```

### Default Values Applied

**Marketing Metrics Defaults:**
- Monthly Marketing Spend: $2,000
- CAC: $150
- LTV: $800
- LTV:CAC Ratio: 5.3:1
- Payback Period: 6 months
- Organic Growth Rate: 25%
- Paid Growth Rate: 75%

**User Analytics Defaults:**
- Average Users per Client: 3
- User Growth Rate: 5%
- User Churn Rate: 2%
- ARPU: $49
- Revenue per User: $16.33
- User Retention Rate: 98%

## Impact on Application

### Frontend Changes
- All forms now use "user" terminology
- Marketing metrics management interface added
- User-level analytics displayed
- Enhanced calculations include marketing costs

### Backend Changes
- All calculations include marketing expenses
- CAC/LTV calculations implemented
- User-level metrics tracked
- Enhanced API endpoints for marketing data

### Data Consistency
- All existing data preserved
- Seamless transition from old to new structure
- Backward compatibility maintained during transition

## Verification

After migration, verify:

1. **New tables exist**: `marketing_metrics`, `user_analytics`
2. **Configurations updated**: Check for `pricePerUser`, `initialUsers`, `marketingMetrics`
3. **Default data populated**: Marketing metrics and user analytics for all users
4. **Terminology updated**: All descriptions use "user" instead of "client"
5. **New add-ons available**: Marketing Intelligence and User Segmentation

## Rollback Plan

If issues arise, the migration can be rolled back:

```bash
npm run migrate:rollback
```

This will:
- Drop `marketing_metrics` and `user_analytics` tables
- Preserve original `configurations` data
- Allow manual restoration if needed

## Support

For issues with the migration:

1. Check migration logs for specific errors
2. Verify database connection and permissions
3. Ensure all dependencies are installed
4. Contact system administrator if problems persist

## Future Considerations

This schema update enables:
- Advanced marketing analytics
- User cohort analysis
- Enhanced SaaS metrics (CAC, LTV, NRR)
- Comprehensive user lifecycle tracking
- Marketing ROI optimization
- Channel performance analysis