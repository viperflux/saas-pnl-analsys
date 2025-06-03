const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generatePasswordHash(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function updateAdminCredentials() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
    console.log('Please set your Neon connection string:');
    console.log('export DATABASE_URL="your-neon-connection-string"');
    process.exit(1);
  }

  console.log('🔐 Update Admin Credentials');
  console.log('==========================');
  console.log('');

  try {
    // Get current admin email to find the user
    const currentEmail = await question('Enter current admin email (admin@localhost.com): ');
    const adminEmail = currentEmail.trim() || 'admin@localhost.com';

    // Get new credentials
    const newEmail = await question('Enter new email (leave empty to keep current): ');
    const newPassword = await question('Enter new password (leave empty to keep current): ');
    const firstName = await question('Enter first name (leave empty to keep current): ');
    const lastName = await question('Enter last name (leave empty to keep current): ');

    if (!newEmail.trim() && !newPassword.trim() && !firstName.trim() && !lastName.trim()) {
      console.log('⚠️  No changes specified. Exiting...');
      process.exit(0);
    }

    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('');
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Check if user exists
    const userQuery = 'SELECT id, email, first_name, last_name FROM users WHERE email = $1 AND role = $2';
    const userResult = await client.query(userQuery, [adminEmail, 'admin']);

    if (userResult.rows.length === 0) {
      console.error(`❌ Admin user with email '${adminEmail}' not found`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`📧 Found admin user: ${user.email}`);

    // Build update query dynamically
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (newEmail.trim()) {
      updates.push(`email = $${valueIndex++}`);
      values.push(newEmail.trim());
    }

    if (newPassword.trim()) {
      console.log('🔄 Generating password hash...');
      const passwordHash = await generatePasswordHash(newPassword.trim());
      updates.push(`password_hash = $${valueIndex++}`);
      values.push(passwordHash);
    }

    if (firstName.trim()) {
      updates.push(`first_name = $${valueIndex++}`);
      values.push(firstName.trim());
    }

    if (lastName.trim()) {
      updates.push(`last_name = $${valueIndex++}`);
      values.push(lastName.trim());
    }

    updates.push(`updated_at = NOW()`);
    values.push(user.id);

    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = $${valueIndex}`;

    console.log('🔄 Updating admin credentials...');
    await client.query(updateQuery, values);

    console.log('✅ Admin credentials updated successfully!');
    console.log('');
    console.log('Updated credentials:');
    if (newEmail.trim()) console.log(`📧 Email: ${newEmail.trim()}`);
    if (newPassword.trim()) console.log(`🔑 Password: ${newPassword.trim()}`);
    if (firstName.trim()) console.log(`👤 First Name: ${firstName.trim()}`);
    if (lastName.trim()) console.log(`👤 Last Name: ${lastName.trim()}`);

    console.log('');
    console.log('🎉 You can now login with your new credentials!');

  } catch (error) {
    console.error('❌ Error updating admin credentials:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Check if this is being run directly
if (require.main === module) {
  updateAdminCredentials().catch(console.error);
}

module.exports = { updateAdminCredentials };