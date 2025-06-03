const { execSync } = require('child_process');

console.log('🚀 Post-deployment migration started...');

// Check if DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  console.log('Please set your database URL in Vercel environment variables');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🗄️ Running database migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  
  console.log('✅ Migration completed successfully!');
  console.log('🎉 Your app is ready to use!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}