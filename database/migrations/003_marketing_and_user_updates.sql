-- Migration 003: Marketing Metrics and User Terminology Updates
-- This migration updates the database schema to:
-- 1. Add marketing metrics table
-- 2. Add user analytics table
-- 3. Update existing configurations to use new terminology
-- 4. Remove AI cost references

-- Create marketing metrics table
CREATE TABLE IF NOT EXISTS marketing_metrics (
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

-- Create user analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
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

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_user_id ON marketing_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_config_id ON marketing_metrics(configuration_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_config_id ON user_analytics(configuration_id);

-- Update existing configurations to use new terminology and add marketing metrics
UPDATE configurations 
SET config = jsonb_set(
    jsonb_set(
        jsonb_set(
            jsonb_set(
                config #- '{openAiCostPerClient}',
                '{pricePerUser}',
                COALESCE(config->>'pricePerClient', '49')::jsonb
            ) #- '{pricePerClient}',
            '{initialUsers}',
            COALESCE(config->>'initialClients', '5')::jsonb
        ) #- '{initialClients}',
        '{monthlyFixedCosts,marketing}',
        '2000'::jsonb
    ),
    '{marketingMetrics}',
    '{
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
    }'::jsonb
)
WHERE config IS NOT NULL;

-- Add default user analytics fields to configurations
UPDATE configurations 
SET config = jsonb_set(
    jsonb_set(
        jsonb_set(
            config,
            '{avgUsersPerClient}',
            '3'::jsonb
        ),
        '{userGrowthRate}',
        '0.05'::jsonb
    ),
    '{userChurnRate}',
    '0.02'::jsonb
)
WHERE config IS NOT NULL AND config->>'avgUsersPerClient' IS NULL;

-- Insert default marketing metrics for all existing users
INSERT INTO marketing_metrics (
    user_id, 
    monthly_marketing_spend, 
    cac, 
    ltv, 
    ltv_cac_ratio, 
    payback_period_months, 
    organic_growth_rate, 
    paid_growth_rate, 
    brand_awareness_spend, 
    performance_marketing_spend, 
    content_marketing_spend, 
    affiliate_marketing_spend, 
    conversion_rate, 
    lead_quality_score, 
    marketing_roi
)
SELECT 
    id,
    2000.00,
    150.00,
    800.00,
    5.30,
    6.00,
    0.25,
    0.75,
    400.00,
    1200.00,
    300.00,
    100.00,
    0.12,
    70,
    4.00
FROM users
WHERE id NOT IN (SELECT user_id FROM marketing_metrics);

-- Insert default user analytics for all existing users
INSERT INTO user_analytics (
    user_id,
    avg_users_per_client,
    user_growth_rate,
    user_churn_rate,
    arpu,
    revenue_per_user,
    user_retention_rate
)
SELECT 
    id,
    3.00,
    0.05,
    0.02,
    49.00,
    16.33,
    0.98
FROM users
WHERE id NOT IN (SELECT user_id FROM user_analytics);

-- Update feature addons to reflect new terminology
UPDATE feature_addons 
SET description = REPLACE(description, 'client', 'user')
WHERE description LIKE '%client%';

UPDATE feature_addons 
SET description = REPLACE(description, 'Client', 'User')
WHERE description LIKE '%Client%';

-- Add new marketing-focused addons
INSERT INTO feature_addons (user_id, name, description, base_price, pricing_model, usage_limit) 
SELECT 
    u.id,
    'Marketing Intelligence',
    'Advanced marketing analytics and CAC/LTV tracking',
    79.00,
    'flat_rate',
    NULL
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM feature_addons fa 
    WHERE fa.user_id = u.id AND fa.name = 'Marketing Intelligence'
);

INSERT INTO feature_addons (user_id, name, description, base_price, pricing_model, usage_limit) 
SELECT 
    u.id,
    'User Segmentation',
    'Advanced user cohort analysis and segmentation',
    59.00,
    'per_user',
    5000
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM feature_addons fa 
    WHERE fa.user_id = u.id AND fa.name = 'User Segmentation'
);

-- Update growth scenarios descriptions to use user terminology
UPDATE growth_scenarios 
SET description = REPLACE(description, 'client', 'user')
WHERE description LIKE '%client%';

UPDATE growth_scenarios 
SET description = REPLACE(description, 'Client', 'User')
WHERE description LIKE '%Client%';

-- Update configuration descriptions
UPDATE configurations 
SET description = REPLACE(description, 'client', 'user')
WHERE description LIKE '%client%';

UPDATE configurations 
SET description = REPLACE(description, 'Client', 'User')
WHERE description LIKE '%Client%';

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at on new tables
CREATE TRIGGER update_marketing_metrics_updated_at 
    BEFORE UPDATE ON marketing_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at 
    BEFORE UPDATE ON user_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();