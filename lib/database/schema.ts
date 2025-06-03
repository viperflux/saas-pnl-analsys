import { pgTable, text, timestamp, jsonb, uuid, varchar, boolean, integer, decimal } from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'admin' or 'user'
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const configurations = pgTable('configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  projectionMonths: integer('projection_months').default(12).notNull(),
  config: jsonb('config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id),
  currentConfigId: uuid('current_config_id').references(() => configurations.id),
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const customPricingTiers = pgTable('custom_pricing_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  configurationId: uuid('configuration_id').references(() => configurations.id),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  features: jsonb('features').notNull(), // Array of feature names
  limits: jsonb('limits').notNull(), // Object with usage limits
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const growthScenarios = pgTable('growth_scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  configurationId: uuid('configuration_id').references(() => configurations.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  growthRates: jsonb('growth_rates').notNull(), // Monthly growth rates array
  seasonalModifiers: jsonb('seasonal_modifiers'), // Optional seasonal adjustments
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const featureAddons = pgTable('feature_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  pricingModel: varchar('pricing_model', { length: 50 }).notNull(), // 'per_user', 'flat_rate', 'usage_based'
  usageLimit: integer('usage_limit'), // For usage-based pricing
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

const configurationAddons = pgTable('configuration_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  configurationId: uuid('configuration_id').references(() => configurations.id).notNull(),
  addonId: uuid('addon_id').references(() => featureAddons.id).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  customPrice: decimal('custom_price', { precision: 10, scale: 2 }), // Override base price if needed
  isEnabled: boolean('is_enabled').default(true).notNull(),
});

export { 
  users, 
  configurations, 
  userSessions, 
  customPricingTiers, 
  growthScenarios, 
  featureAddons, 
  configurationAddons 
};
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Configuration = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type CustomPricingTier = typeof customPricingTiers.$inferSelect;
export type NewCustomPricingTier = typeof customPricingTiers.$inferInsert;
export type GrowthScenario = typeof growthScenarios.$inferSelect;
export type NewGrowthScenario = typeof growthScenarios.$inferInsert;
export type FeatureAddon = typeof featureAddons.$inferSelect;
export type NewFeatureAddon = typeof featureAddons.$inferInsert;
export type ConfigurationAddon = typeof configurationAddons.$inferSelect;
export type NewConfigurationAddon = typeof configurationAddons.$inferInsert;