import bcrypt from 'bcryptjs';
import { getUserByEmail } from '../lib/db';

async function testAuth() {
  console.log('Testing authentication...');
  
  // Test password hashing
  const testPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(testPassword, 12);
  console.log('Generated hash for "admin123":', hashedPassword);
  
  // Test verification with our stored hash
  const storedHash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log('Password verification result:', isValid);
  
  // Test getting user from database
  try {
    const user = await getUserByEmail('admin@localhost.com');
    console.log('User from database:', user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPasswordHash: !!user.passwordHash
    } : null);
    
    if (user) {
      const dbPasswordValid = await bcrypt.compare(testPassword, user.passwordHash);
      console.log('Password valid against DB hash:', dbPasswordValid);
    }
  } catch (error) {
    console.error('Error getting user:', error);
  }
  
  process.exit(0);
}

testAuth();