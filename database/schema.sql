-- Create tables for the SaaS Cash Flow & P&L Analyzer with Marketing Metrics

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create configurations table with user_id and projection_months
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    projection_months INTEGER DEFAULT 12 NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id),
    current_config_id UUID REFERENCES configurations(id),
    last_accessed TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create custom pricing tiers table
CREATE TABLE custom_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    configuration_id UUID REFERENCES configurations(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create growth scenarios table
CREATE TABLE growth_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    configuration_id UUID REFERENCES configurations(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    growth_rates JSONB NOT NULL,
    seasonal_modifiers JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create feature add-ons table
CREATE TABLE feature_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    pricing_model VARCHAR(50) NOT NULL,
    usage_limit INTEGER,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create configuration add-ons junction table
CREATE TABLE configuration_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    configuration_id UUID NOT NULL REFERENCES configurations(id),
    addon_id UUID NOT NULL REFERENCES feature_addons(id),
    quantity INTEGER DEFAULT 1 NOT NULL,
    custom_price DECIMAL(10,2),
    is_enabled BOOLEAN DEFAULT true NOT NULL
);

-- Create marketing metrics table for storing user marketing configurations
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

-- Create user analytics table for tracking user-level metrics
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_configurations_user_id ON configurations(user_id);
CREATE INDEX idx_configurations_is_default ON configurations(is_default);
CREATE INDEX idx_configurations_updated_at ON configurations(updated_at);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_accessed ON user_sessions(last_accessed);
CREATE INDEX idx_custom_pricing_tiers_user_id ON custom_pricing_tiers(user_id);
CREATE INDEX idx_custom_pricing_tiers_config_id ON custom_pricing_tiers(configuration_id);
CREATE INDEX idx_growth_scenarios_user_id ON growth_scenarios(user_id);
CREATE INDEX idx_growth_scenarios_config_id ON growth_scenarios(configuration_id);
CREATE INDEX idx_feature_addons_user_id ON feature_addons(user_id);
CREATE INDEX idx_configuration_addons_config_id ON configuration_addons(configuration_id);
CREATE INDEX idx_configuration_addons_addon_id ON configuration_addons(addon_id);
CREATE INDEX idx_marketing_metrics_user_id ON marketing_metrics(user_id);
CREATE INDEX idx_marketing_metrics_config_id ON marketing_metrics(configuration_id);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_config_id ON user_analytics(configuration_id);

-- Insert default admin user (password: admin123 - should be changed after first login)
-- Password hash for 'admin123' using bcrypt with 12 salt rounds
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (
    'admin@gmail.com',
    '$2b$12$iHncZ76nWAnnWfgZWPPuX.27OGQdjolQ9S6e8OGS0QrFhIB.zsnPG',
    'admin',
    'Deuce',
    'Rabbit'
);

-- Insert default configuration linked to admin user (updated with new structure)
INSERT INTO configurations (user_id, name, description, is_default, config) VALUES (
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'Default Configuration',
    'Default SaaS financial configuration with marketing metrics',
    true,
    '{
        "startingCash": 0,
        "startDate": "2025-06-01",
        "pricePerUser": 49,
        "churnRate": 0.03,
        "monthlyFixedCosts": {
            "infra": 1588.60,
            "salary": 3000,
            "support": 500,
            "wages": 1000,
            "hosting": 1600,
            "marketing": 2000
        },
        "capitalPurchases": [2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "seasonalGrowth": [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3],
        "initialUsers": 5,
        "projectionMonths": 12,
        "avgUsersPerClient": 3,
        "userGrowthRate": 0.05,
        "userChurnRate": 0.02,
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
    }'
);

-- Insert default marketing metrics for admin user
INSERT INTO marketing_metrics (user_id, monthly_marketing_spend, cac, ltv, ltv_cac_ratio, payback_period_months, organic_growth_rate, paid_growth_rate, brand_awareness_spend, performance_marketing_spend, content_marketing_spend, affiliate_marketing_spend, conversion_rate, lead_quality_score, marketing_roi) VALUES (
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
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
);

-- Insert default user analytics for admin user
INSERT INTO user_analytics (user_id, avg_users_per_client, user_growth_rate, user_churn_rate, arpu, revenue_per_user, user_retention_rate) VALUES (
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    3.00,
    0.05,
    0.02,
    49.00,
    16.33,
    0.98
);

-- Insert default growth scenarios for admin user
INSERT INTO growth_scenarios (user_id, name, description, growth_rates, is_default) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Conservative Growth', 'Steady 5-8% monthly growth with seasonal variations',
 '[5, 6, 7, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, true),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Aggressive Growth', 'High growth targeting 10-15% monthly increases',
 '[10, 12, 15, 12, 13, 14, 15, 13, 12, 10, 8, 10, 12, 15, 18, 15, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12]'::jsonb, false),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Market Entry', 'Initial rapid growth followed by stabilization',
 '[20, 25, 30, 25, 20, 15, 12, 10, 8, 6, 5, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, false);

-- Insert default feature add-ons for admin user (updated descriptions)
INSERT INTO feature_addons (user_id, name, description, base_price, pricing_model, usage_limit) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Premium Support', '24/7 priority support with dedicated account manager', 99.00, 'flat_rate', NULL),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'API Access', 'Advanced API access with higher rate limits per user', 29.00, 'per_user', 10000),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'White Labeling', 'Remove branding and customize with your own', 199.00, 'flat_rate', NULL),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Advanced Analytics', 'Detailed user analytics and custom dashboards', 49.00, 'usage_based', 1000),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Marketing Intelligence', 'Advanced marketing analytics and CAC/LTV tracking', 79.00, 'flat_rate', NULL),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'User Segmentation', 'Advanced user cohort analysis and segmentation', 59.00, 'per_user', 5000);