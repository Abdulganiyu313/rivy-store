require("dotenv").config();
const { Client } = require("pg");

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
      CREATE TABLE IF NOT EXISTS "Orders" (
        id              SERIAL PRIMARY KEY,
        status          TEXT NOT NULL DEFAULT 'placed',
        "subtotalKobo"  INTEGER NOT NULL DEFAULT 0,
        "taxKobo"       INTEGER NOT NULL DEFAULT 0,
        "totalKobo"     INTEGER NOT NULL DEFAULT 0,
        name            TEXT,
        email           TEXT,
        address         TEXT,
        currency        TEXT,
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS orders_created_at ON "Orders"("createdAt");
      CREATE INDEX IF NOT EXISTS orders_status ON "Orders"(status);

      CREATE TABLE IF NOT EXISTS "OrderItems" (
        id              SERIAL PRIMARY KEY,
        "orderId"       INTEGER NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
        "productId"     INTEGER REFERENCES "Products"(id) ON DELETE SET NULL,
        name            TEXT NOT NULL,
        "unitPriceKobo" INTEGER NOT NULL,
        qty             INTEGER NOT NULL,
        "subtotalKobo"  INTEGER NOT NULL,
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS orderitems_orderId ON "OrderItems"("orderId");
      CREATE INDEX IF NOT EXISTS orderitems_productId ON "OrderItems"("productId");
    `);

    const o = await client.query(`SELECT COUNT(*)::int AS n FROM "Orders"`);
    const i = await client.query(`SELECT COUNT(*)::int AS n FROM "OrderItems"`);
    console.log("Orders:", o.rows[0].n, "OrderItems:", i.rows[0].n);
    console.log("Bootstrap complete.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
