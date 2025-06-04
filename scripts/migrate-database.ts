#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Execute the migration step by step
    await sql.begin(async sql => {
      console.log('📝 Executing migration in transaction...');
      
      // Step 1: Create marketing metrics table
      console.log('⚡ Creating marketing_metrics table...');
      await sql`
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
        )
      `;
      
      // Step 2: Create user analytics table
      console.log('⚡ Creating user_analytics table...');
      await sql`
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
        )
      `;
      
      // Step 3: Create indexes
      console.log('⚡ Creating indexes...');
      await sql`CREATE INDEX IF NOT EXISTS idx_marketing_metrics_user_id ON marketing_metrics(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_marketing_metrics_config_id ON marketing_metrics(configuration_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_user_analytics_config_id ON user_analytics(configuration_id)`;
      
      // Step 4: Insert marketing metrics for all users
      console.log('⚡ Inserting default marketing metrics...');
      await sql`
        INSERT INTO marketing_metrics (
          user_id, monthly_marketing_spend, cac, ltv, ltv_cac_ratio, 
          payback_period_months, organic_growth_rate, paid_growth_rate,
          brand_awareness_spend, performance_marketing_spend, content_marketing_spend,
          affiliate_marketing_spend, conversion_rate, lead_quality_score, marketing_roi
        )
        SELECT 
          id, 2000.00, 150.00, 800.00, 5.30, 6.00, 0.25, 0.75,
          400.00, 1200.00, 300.00, 100.00, 0.12, 70, 4.00
        FROM users
        WHERE id NOT IN (SELECT user_id FROM marketing_metrics WHERE user_id IS NOT NULL)
      `;
      
      // Step 5: Insert user analytics for all users
      console.log('⚡ Inserting default user analytics...');
      await sql`
        INSERT INTO user_analytics (
          user_id, avg_users_per_client, user_growth_rate, user_churn_rate,
          arpu, revenue_per_user, user_retention_rate
        )
        SELECT 
          id, 3.00, 0.05, 0.02, 49.00, 16.33, 0.98
        FROM users
        WHERE id NOT IN (SELECT user_id FROM user_analytics WHERE user_id IS NOT NULL)
      `;
      
      // Step 6: Update configurations with new structure
      console.log('⚡ Updating configurations...');
      
      // First ensure config is valid JSONB, fix invalid ones
      await sql`
        UPDATE configurations 
        SET config = '{
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
        }'::jsonb
        WHERE config IS NULL OR jsonb_typeof(config) != 'object'
      `;
      
      // Update valid JSONB configs to new structure
      await sql`
        UPDATE configurations 
        SET config = config || '{
          "pricePerUser": 49,
          "initialUsers": 5,
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
        }'::jsonb
        WHERE jsonb_typeof(config) = 'object'
      `;
      
      // Add marketing to monthlyFixedCosts if it exists
      await sql`
        UPDATE configurations 
        SET config = jsonb_set(config, '{monthlyFixedCosts,marketing}', '2000'::jsonb)
        WHERE config ? 'monthlyFixedCosts' 
        AND jsonb_typeof(config->'monthlyFixedCosts') = 'object'
        AND NOT (config->'monthlyFixedCosts' ? 'marketing')
      `;
      
      // Step 7: Add new marketing addons
      console.log('⚡ Adding marketing addons...');
      await sql`
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
        )
      `;
      
      await sql`
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
        )
      `;
      
      // Step 8: Update terminology in descriptions
      console.log('⚡ Updating terminology to use "user" instead of "client"...');
      
      await sql`
        UPDATE feature_addons 
        SET description = REPLACE(REPLACE(description, 'client', 'user'), 'Client', 'User')
        WHERE description LIKE '%client%' OR description LIKE '%Client%'
      `;
      
      await sql`
        UPDATE growth_scenarios 
        SET description = REPLACE(REPLACE(description, 'client', 'user'), 'Client', 'User')
        WHERE description LIKE '%client%' OR description LIKE '%Client%'
      `;
      
      await sql`
        UPDATE configurations 
        SET description = REPLACE(REPLACE(description, 'client', 'user'), 'Client', 'User')
        WHERE description LIKE '%client%' OR description LIKE '%Client%'
      `;
    });
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('marketing_metrics', 'user_analytics')
    `;
    
    console.log(`✅ Found ${tables.length} new tables:`, tables.map(t => t.table_name));
    
    const configCheck = await sql`
      SELECT COUNT(*) as count
      FROM configurations 
      WHERE config->>'pricePerUser' IS NOT NULL
      AND config->>'initialUsers' IS NOT NULL
      AND config->'marketingMetrics' IS NOT NULL
    `;
    
    console.log(`✅ Updated ${configCheck[0].count} configurations with new structure`);
    
    const marketingCount = await sql`SELECT COUNT(*) as count FROM marketing_metrics`;
    console.log(`✅ Created ${marketingCount[0].count} marketing metrics records`);
    
    const analyticsCount = await sql`SELECT COUNT(*) as count FROM user_analytics`;
    console.log(`✅ Created ${analyticsCount[0].count} user analytics records`);
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('• Added marketing_metrics table with CAC, LTV, marketing spend tracking');
    console.log('• Added user_analytics table with user-level metrics');
    console.log('• Updated configurations to use "user" terminology instead of "client"');
    console.log('• Added marketing spend to configurations');
    console.log('• Added marketingMetrics object to all configurations');
    console.log('• Added user growth and churn rate fields');
    console.log('• Updated all descriptions to use "user" terminology');
    console.log('• Added new marketing-focused feature addons');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

async function rollback() {
  try {
    console.log('🔄 Rolling back migration...');
    
    await sql`DROP TABLE IF EXISTS user_analytics CASCADE`;
    await sql`DROP TABLE IF EXISTS marketing_metrics CASCADE`;
    
    console.log('✅ Rollback completed');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

const command = process.argv[2];

if (command === 'rollback') {
  rollback();
} else {
  runMigration();
}