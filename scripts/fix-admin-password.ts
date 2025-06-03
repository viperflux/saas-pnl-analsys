import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://razorx@localhost:5432/pnlanalysis';

async function fixAdminPassword() {
  const sql = postgres(connectionString);
  const db = drizzle(sql);
  
  try {
    console.log('Generating new password hash for admin123...');
    
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('New hash:', hashedPassword);
    
    // Update the admin user's password
    const result = await db
      .update(users)
      .set({ passwordHash: hashedPassword, updatedAt: new Date() })
      .where(eq(users.email, 'admin@localhost.com'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('You can now login with:');
      console.log('Email: admin@localhost.com');
      console.log('Password: admin123');
      
      // Test the new hash
      const testResult = await bcrypt.compare(password, hashedPassword);
      console.log('Password verification test:', testResult ? '✅ PASS' : '❌ FAIL');
    } else {
      console.log('❌ Failed to update admin password - user not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await sql.end();
  }
}

fixAdminPassword();