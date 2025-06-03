const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
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

async function setupAdmin() {
  console.log('🔐 Admin User Setup');
  console.log('================');
  console.log('');

  try {
    // Get email
    const email = await question('Enter admin email (default: admin@localhost.com): ');
    const adminEmail = email.trim() || 'admin@localhost.com';

    // Get password
    const password = await question('Enter admin password (default: admin123): ');
    const adminPassword = password.trim() || 'admin123';

    // Get names
    const firstName = await question('Enter first name (default: System): ');
    const lastName = await question('Enter last name (default: Administrator): ');
    const adminFirstName = firstName.trim() || 'System';
    const adminLastName = lastName.trim() || 'Administrator';

    console.log('');
    console.log('🔄 Generating password hash...');
    
    const passwordHash = await generatePasswordHash(adminPassword);
    
    console.log('✅ Password hash generated');
    console.log('');
    console.log('Admin credentials:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminFirstName} ${adminLastName}`);
    console.log('');

    // Read current schema
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Replace the INSERT statement for admin user
    const insertPattern = /INSERT INTO users \(email, password_hash, role, first_name, last_name\) VALUES \(\s*'[^']*',\s*'[^']*',\s*'admin',\s*'[^']*',\s*'[^']*'\s*\);/;
    
    const newInsert = `INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (
    '${adminEmail}',
    '${passwordHash}',
    'admin',
    '${adminFirstName}',
    '${adminLastName}'
);`;

    if (insertPattern.test(schema)) {
      schema = schema.replace(insertPattern, newInsert);
      console.log('✅ Updated existing admin user in schema.sql');
    } else {
      console.log('⚠️  Could not find existing admin user insert. Adding new one...');
      // Add the insert before the default configuration insert
      const configInsertIndex = schema.indexOf('INSERT INTO configurations');
      if (configInsertIndex !== -1) {
        const insertPoint = schema.lastIndexOf('\n', configInsertIndex);
        schema = schema.slice(0, insertPoint) + '\n\n' + newInsert + '\n' + schema.slice(insertPoint);
      } else {
        schema += '\n\n' + newInsert;
      }
    }

    // Write updated schema
    fs.writeFileSync(schemaPath, schema);
    
    console.log('✅ Schema updated successfully!');
    console.log('');
    console.log('📁 Updated file: schema.sql');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:upload');
    console.log('2. Add DATABASE_URL to Vercel environment variables');
    console.log('3. Deploy your app');
    console.log('4. Login with your new credentials');

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Check if this is being run directly
if (require.main === module) {
  setupAdmin().catch(console.error);
}

module.exports = { setupAdmin };