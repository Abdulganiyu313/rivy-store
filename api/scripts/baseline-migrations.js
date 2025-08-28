require("dotenv").config();
const { Client } = require("pg");

const done = [
  "20250820-create-core-tables.js",
  "20250821-hello.js",
  "20250821-add-product-fields.js",
  "20250822-add-product-financingEligible.js",
  "20250823-ensure-priceKobo.js",
  "20250824-001-create-orders.js",
  "20250824-002-create-order-items.js",
];

(async () => {
  const useSSL =
    String(process.env.DATABASE_SSL || "").toLowerCase() === "true";
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) PRIMARY KEY
      );
    `);
    for (const name of done) {
      await client.query(
        `INSERT INTO "SequelizeMeta"("name") VALUES ($1) ON CONFLICT DO NOTHING`,
        [name]
      );
    }
    const r = await client.query(
      `SELECT COUNT(*)::int AS n FROM "SequelizeMeta"`
    );
    console.log("SequelizeMeta entries:", r.rows[0].n);
    console.log("Baseline complete.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
