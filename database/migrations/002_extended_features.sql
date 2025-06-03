-- Migration: Add extended features for multi-year projections, custom pricing tiers, growth scenarios, and feature add-ons

-- Add user_id to configurations table and projection_months
ALTER TABLE configurations 
ADD COLUMN user_id UUID REFERENCES users(id),
ADD COLUMN projection_months INTEGER DEFAULT 12 NOT NULL;

-- Update existing configurations to link to admin user
UPDATE configurations 
SET user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after update
ALTER TABLE configurations 
ALTER COLUMN user_id SET NOT NULL;

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
CREATE INDEX idx_configurations_user_id ON configurations(user_id);
CREATE INDEX idx_custom_pricing_tiers_user_id ON custom_pricing_tiers(user_id);
CREATE INDEX idx_custom_pricing_tiers_config_id ON custom_pricing_tiers(configuration_id);
CREATE INDEX idx_growth_scenarios_user_id ON growth_scenarios(user_id);
CREATE INDEX idx_growth_scenarios_config_id ON growth_scenarios(configuration_id);
CREATE INDEX idx_feature_addons_user_id ON feature_addons(user_id);
CREATE INDEX idx_configuration_addons_config_id ON configuration_addons(configuration_id);
CREATE INDEX idx_configuration_addons_addon_id ON configuration_addons(addon_id);

-- Insert default growth scenarios for admin user
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO growth_scenarios (user_id, name, description, growth_rates, is_default) VALUES
        (admin_user_id, 'Conservative Growth', 'Steady 5-8% monthly growth with seasonal variations', 
         '[5, 6, 7, 5, 6, 7, 8, 7, 6, 5, 4, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, true),
        (admin_user_id, 'Aggressive Growth', 'High growth targeting 10-15% monthly increases',
         '[10, 12, 15, 12, 13, 14, 15, 13, 12, 10, 8, 10, 12, 15, 18, 15, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12, 13, 15, 18, 16, 14, 12]'::jsonb, false),
        (admin_user_id, 'Market Entry', 'Initial rapid growth followed by stabilization',
         '[20, 25, 30, 25, 20, 15, 12, 10, 8, 6, 5, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5, 6, 7, 8, 7, 6, 5]'::jsonb, false);
        
        -- Insert default feature add-ons
        INSERT INTO feature_addons (user_id, name, description, base_price, pricing_model, usage_limit) VALUES
        (admin_user_id, 'Premium Support', '24/7 priority support with dedicated account manager', 99.00, 'flat_rate', NULL),
        (admin_user_id, 'API Access', 'Advanced API access with higher rate limits', 29.00, 'per_user', 10000),
        (admin_user_id, 'White Labeling', 'Remove branding and customize with your own', 199.00, 'flat_rate', NULL),
        (admin_user_id, 'Advanced Analytics', 'Detailed reporting and custom dashboards', 49.00, 'usage_based', 1000);
    END IF;
END $$;