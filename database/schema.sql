-- Create tables for the SaaS Cash Flow & P&L Analyzer

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

-- Insert default admin user (password: admin123 - should be changed after first login)
-- Password hash for 'admin123' using bcrypt with 12 salt rounds
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (
    'admin@gmail.com',
    '$2b$12$iHncZ76nWAnnWfgZWPPuX.27OGQdjolQ9S6e8OGS0QrFhIB.zsnPG',
    'admin',
    'Deuce',
    'Rabbit'
);

-- Insert default configuration linked to admin user
INSERT INTO configurations (user_id, name, description, is_default, config) VALUES (
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'Default Configuration',
    'Default SaaS financial configuration with sample data',
    true,
    '{
        "startingCash": 0,
        "startDate": "2025-06-01",
        "pricePerClient": 49,
        "churnRate": 0.03,
        "monthlyFixedCosts": {
            "infra": 1588.60,
            "salary": 3000,
            "support": 500,
            "wages": 1000,
            "hosting": 1600
        },
        "openAiCostPerClient": 5,
        "capitalPurchases": [2000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "seasonalGrowth": [8, 10, 12, 5, 6, 7, 10, 12, 8, 5, 4, 3],
        "initialClients": 5
    }'
);

-- Insert default growth scenarios for admin user
INSERT INTO growth_scenarios (user_id, name, description, growth_rates, is_default) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Conservative Growth', 'Steady 5-8% monthly growth with seasonal variations',
 '[5, 6, 7, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, true),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Aggressive Growth', 'High growth targeting 10-15% monthly increases',
 '[10, 12, 15, 12, 13, 14, 15, 13, 12, 10, 8, 10, 12, 15, 18, 15, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12]'::jsonb, false),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Market Entry', 'Initial rapid growth followed by stabilization',
 '[20, 25, 30, 25, 20, 15, 12, 10, 8, 6, 5, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, false);

-- Insert default feature add-ons for admin user
INSERT INTO feature_addons (user_id, name, description, base_price, pricing_model, usage_limit) VALUES
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Premium Support', '24/7 priority support with dedicated account manager', 99.00, 'flat_rate', NULL),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'API Access', 'Advanced API access with higher rate limits', 29.00, 'per_user', 10000),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'White Labeling', 'Remove branding and customize with your own', 199.00, 'flat_rate', NULL),
((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 'Advanced Analytics', 'Detailed reporting and custom dashboards', 49.00, 'usage_based', 1000);
