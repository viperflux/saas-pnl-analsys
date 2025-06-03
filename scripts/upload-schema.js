const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function uploadSchema() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error(
      "❌ DATABASE_URL or POSTGRES_URL environment variable is required",
    );
    console.log("Please set your Neon connection string:");
    console.log(
      'export DATABASE_URL="postgresql://pnlanalysis_owner:npg_Oi7VgGDCmRy3@ep-sweet-thunder-a9f5rgjh-pooler.gwc.azure.neon.tech/pnlanalysis?sslmode=require"',
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("🔗 Connecting to Neon database...");
    await client.connect();
    console.log("✅ Connected successfully!");

    // Read the schema file
    const schemaPath = path.join(__dirname, "..", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📂 Reading schema.sql...");
    console.log("🚀 Executing schema...");

    // Execute the schema
    await client.query(schema);

    console.log("✅ Schema uploaded successfully!");
    console.log("");
    console.log("🎉 Your database is now ready!");
    console.log("");
    console.log("Next steps:");
    console.log(
      "1. Add this DATABASE_URL to your Vercel environment variables",
    );
    console.log("2. Deploy your app to Vercel");
    console.log("3. Test login with: admin@localhost.com / admin123");
  } catch (error) {
    console.error("❌ Error uploading schema:", error.message);

    if (error.message.includes("already exists")) {
      console.log("");
      console.log("💡 It looks like your database already has some tables.");
      console.log("You might want to:");
      console.log("1. Drop existing tables first, or");
      console.log("2. Use migrations instead");
    }

    process.exit(1);
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Check if this is being run directly
if (require.main === module) {
  uploadSchema().catch(console.error);
}

module.exports = { uploadSchema };
