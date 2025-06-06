import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, configurations, userSessions, customPricingTiers, growthScenarios, featureAddons, configurationAddons, marketingMetrics, userAnalytics } from './schema';
import type { 
  User, NewUser, Configuration, NewConfiguration, UserSession, NewUserSession,
  CustomPricingTier, NewCustomPricingTier, GrowthScenario, NewGrowthScenario,
  FeatureAddon, NewFeatureAddon, ConfigurationAddon, NewConfigurationAddon,
  MarketingMetric, NewMarketingMetric, UserAnalytic, NewUserAnalytic
} from './schema';
import { eq, desc, and } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const sql = postgres(connectionString);
export const db = drizzle(sql);

// Configuration management functions
export async function createConfiguration(config: NewConfiguration): Promise<Configuration> {
  const [newConfig] = await db.insert(configurations).values(config).returning();
  return newConfig;
}

export async function getConfiguration(id: string): Promise<Configuration | null> {
  const [config] = await db.select().from(configurations).where(eq(configurations.id, id));
  return config || null;
}

export async function getAllConfigurations(): Promise<Configuration[]> {
  return await db.select().from(configurations).orderBy(desc(configurations.updatedAt));
}

export async function getUserConfigurations(userId: string): Promise<Configuration[]> {
  return await db.select().from(configurations)
    .where(eq(configurations.userId, userId))
    .orderBy(desc(configurations.updatedAt));
}

export async function getDefaultConfiguration(): Promise<Configuration | null> {
  const [config] = await db.select().from(configurations).where(eq(configurations.isDefault, true));
  return config || null;
}

export async function updateConfiguration(id: string, updates: Partial<NewConfiguration>): Promise<Configuration | null> {
  const [updatedConfig] = await db
    .update(configurations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(configurations.id, id))
    .returning();
  return updatedConfig || null;
}

export async function deleteConfiguration(id: string): Promise<boolean> {
  try {
    await db.delete(configurations).where(eq(configurations.id, id));
    return true;
  } catch (error) {
    return false;
  }
}

export async function setDefaultConfiguration(id: string): Promise<void> {
  // First, unset all default flags
  await db.update(configurations).set({ isDefault: false });
  // Then set the specified config as default
  await db.update(configurations).set({ isDefault: true }).where(eq(configurations.id, id));
}

// Session management functions
export async function createOrUpdateSession(sessionId: string, configId?: string): Promise<UserSession> {
  const existingSession = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
  
  if (existingSession.length > 0) {
    const [updatedSession] = await db
      .update(userSessions)
      .set({ 
        currentConfigId: configId || existingSession[0].currentConfigId,
        lastAccessed: new Date() 
      })
      .where(eq(userSessions.sessionId, sessionId))
      .returning();
    return updatedSession;
  } else {
    const [newSession] = await db
      .insert(userSessions)
      .values({ 
        sessionId, 
        currentConfigId: configId,
        lastAccessed: new Date() 
      })
      .returning();
    return newSession;
  }
}

export async function getSession(sessionId: string): Promise<UserSession | null> {
  const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
  return session || null;
}

export async function updateSessionConfig(sessionId: string, configId: string): Promise<void> {
  await db
    .update(userSessions)
    .set({ currentConfigId: configId, lastAccessed: new Date() })
    .where(eq(userSessions.sessionId, sessionId));
}

// User management functions
export async function createUser(user: NewUser): Promise<User> {
  const [newUser] = await db.insert(users).values(user).returning();
  return newUser;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(id: string, updates: Partial<NewUser>): Promise<User | null> {
  const [updatedUser] = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updatedUser || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await db.delete(users).where(eq(users.id, id));
    return true;
  } catch (error) {
    return false;
  }
}

export async function toggleUserStatus(id: string): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;
  
  return updateUser(id, { isActive: !user.isActive });
}

// Custom Pricing Tiers functions
export async function createCustomPricingTier(tier: NewCustomPricingTier): Promise<CustomPricingTier> {
  const [newTier] = await db.insert(customPricingTiers).values(tier).returning();
  return newTier;
}

export async function getUserPricingTiers(userId: string): Promise<CustomPricingTier[]> {
  return await db.select().from(customPricingTiers)
    .where(eq(customPricingTiers.userId, userId))
    .orderBy(desc(customPricingTiers.createdAt));
}

export async function getConfigurationPricingTiers(configId: string): Promise<CustomPricingTier[]> {
  return await db.select().from(customPricingTiers)
    .where(eq(customPricingTiers.configurationId, configId));
}

export async function updatePricingTier(id: string, updates: Partial<NewCustomPricingTier>): Promise<CustomPricingTier | null> {
  const [updatedTier] = await db
    .update(customPricingTiers)
    .set(updates)
    .where(eq(customPricingTiers.id, id))
    .returning();
  return updatedTier || null;
}

export async function deletePricingTier(id: string): Promise<boolean> {
  try {
    await db.delete(customPricingTiers).where(eq(customPricingTiers.id, id));
    return true;
  } catch (error) {
    return false;
  }
}

// Growth Scenarios functions
export async function createGrowthScenario(scenario: NewGrowthScenario): Promise<GrowthScenario> {
  const [newScenario] = await db.insert(growthScenarios).values(scenario).returning();
  return newScenario;
}

export async function getUserGrowthScenarios(userId: string): Promise<GrowthScenario[]> {
  return await db.select().from(growthScenarios)
    .where(eq(growthScenarios.userId, userId))
    .orderBy(desc(growthScenarios.createdAt));
}

export async function getConfigurationGrowthScenarios(configId: string): Promise<GrowthScenario[]> {
  return await db.select().from(growthScenarios)
    .where(eq(growthScenarios.configurationId, configId));
}

// Marketing Metrics functions
export async function createMarketingMetrics(metrics: NewMarketingMetric): Promise<MarketingMetric> {
  const [newMetrics] = await db.insert(marketingMetrics).values(metrics).returning();
  return newMetrics;
}

export async function getMarketingMetrics(userId: string): Promise<MarketingMetric | null> {
  const [metrics] = await db.select().from(marketingMetrics)
    .where(eq(marketingMetrics.userId, userId))
    .orderBy(desc(marketingMetrics.createdAt));
  return metrics || null;
}

export async function updateMarketingMetrics(userId: string, updates: Partial<NewMarketingMetric>): Promise<MarketingMetric | null> {
  const [updatedMetrics] = await db
    .update(marketingMetrics)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(marketingMetrics.userId, userId))
    .returning();
  return updatedMetrics || null;
}

export async function getMarketingMetricsByConfig(configId: string): Promise<MarketingMetric | null> {
  const [metrics] = await db.select().from(marketingMetrics)
    .where(eq(marketingMetrics.configurationId, configId));
  return metrics || null;
}

// User Analytics functions
export async function createUserAnalytics(analytics: NewUserAnalytic): Promise<UserAnalytic> {
  const [newAnalytics] = await db.insert(userAnalytics).values(analytics).returning();
  return newAnalytics;
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytic | null> {
  const [analytics] = await db.select().from(userAnalytics)
    .where(eq(userAnalytics.userId, userId))
    .orderBy(desc(userAnalytics.createdAt));
  return analytics || null;
}

export async function updateUserAnalytics(userId: string, updates: Partial<NewUserAnalytic>): Promise<UserAnalytic | null> {
  const [updatedAnalytics] = await db
    .update(userAnalytics)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userAnalytics.userId, userId))
    .returning();
  return updatedAnalytics || null;
}

export async function getUserAnalyticsByConfig(configId: string): Promise<UserAnalytic | null> {
  const [analytics] = await db.select().from(userAnalytics)
    .where(eq(userAnalytics.configurationId, configId));
  return analytics || null;
}

// Combined analytics functions
export async function getCompleteUserAnalytics(userId: string): Promise<{
  marketingMetrics: MarketingMetric | null;
  userAnalytics: UserAnalytic | null;
}> {
  const [marketing, analytics] = await Promise.all([
    getMarketingMetrics(userId),
    getUserAnalytics(userId)
  ]);
  
  return {
    marketingMetrics: marketing,
    userAnalytics: analytics
  };
}

export async function initializeUserAnalytics(userId: string, configId?: string): Promise<{
  marketingMetrics: MarketingMetric;
  userAnalytics: UserAnalytic;
}> {
  // Create default marketing metrics
  const defaultMarketing: NewMarketingMetric = {
    userId,
    configurationId: configId || null,
    monthlyMarketingSpend: '2000',
    cac: '150',
    ltv: '800',
    ltvCacRatio: '5.3',
    paybackPeriodMonths: '6',
    organicGrowthRate: '0.25',
    paidGrowthRate: '0.75',
    brandAwarenessSpend: '400',
    performanceMarketingSpend: '1200',
    contentMarketingSpend: '300',
    affiliateMarketingSpend: '100',
    conversionRate: '0.12',
    leadQualityScore: 70,
    marketingRoi: '4.0'
  };

  // Create default user analytics
  const defaultAnalytics: NewUserAnalytic = {
    userId,
    configurationId: configId || null,
    avgUsersPerClient: '3',
    userGrowthRate: '0.05',
    userChurnRate: '0.02',
    arpu: '49',
    revenuePerUser: '16.33',
    userRetentionRate: '0.98'
  };

  const [marketing, analytics] = await Promise.all([
    createMarketingMetrics(defaultMarketing),
    createUserAnalytics(defaultAnalytics)
  ]);

  return { marketingMetrics: marketing, userAnalytics: analytics };
}

export async function updateGrowthScenario(id: string, updates: Partial<NewGrowthScenario>): Promise<GrowthScenario | null> {
  const [updatedScenario] = await db
    .update(growthScenarios)
    .set(updates)
    .where(eq(growthScenarios.id, id))
    .returning();
  return updatedScenario || null;
}

export async function deleteGrowthScenario(id: string): Promise<boolean> {
  try {
    await db.delete(growthScenarios).where(eq(growthScenarios.id, id));
    return true;
  } catch (error) {
    return false;
  }
}

// Feature Add-ons functions
export async function createFeatureAddon(addon: NewFeatureAddon): Promise<FeatureAddon> {
  const [newAddon] = await db.insert(featureAddons).values(addon).returning();
  return newAddon;
}

export async function getUserFeatureAddons(userId: string): Promise<FeatureAddon[]> {
  return await db.select().from(featureAddons)
    .where(eq(featureAddons.userId, userId))
    .orderBy(desc(featureAddons.createdAt));
}

export async function updateFeatureAddon(id: string, updates: Partial<NewFeatureAddon>): Promise<FeatureAddon | null> {
  const [updatedAddon] = await db
    .update(featureAddons)
    .set(updates)
    .where(eq(featureAddons.id, id))
    .returning();
  return updatedAddon || null;
}

export async function deleteFeatureAddon(id: string): Promise<boolean> {
  try {
    await db.delete(featureAddons).where(eq(featureAddons.id, id));
    return true;
  } catch (error) {
    return false;
  }
}

// Configuration Add-ons functions
export async function addConfigurationAddon(configAddon: NewConfigurationAddon): Promise<ConfigurationAddon> {
  const [newConfigAddon] = await db.insert(configurationAddons).values(configAddon).returning();
  return newConfigAddon;
}

export async function getConfigurationAddons(configId: string): Promise<ConfigurationAddon[]> {
  return await db.select().from(configurationAddons)
    .where(eq(configurationAddons.configurationId, configId));
}

export async function updateConfigurationAddon(id: string, updates: Partial<NewConfigurationAddon>): Promise<ConfigurationAddon | null> {
  const [updatedConfigAddon] = await db
    .update(configurationAddons)
    .set(updates)
    .where(eq(configurationAddons.id, id))
    .returning();
  return updatedConfigAddon || null;
}

export async function removeConfigurationAddon(configId: string, addonId: string): Promise<boolean> {
  try {
    await db.delete(configurationAddons)
      .where(and(
        eq(configurationAddons.configurationId, configId),
        eq(configurationAddons.addonId, addonId)
      ));
    return true;
  } catch (error) {
    return false;
  }
}