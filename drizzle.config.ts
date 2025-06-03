import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  },
  introspect: {
    casing: 'preserve',
  },
} satisfies Config;