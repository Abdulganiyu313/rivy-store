require("dotenv").config({ override: true });
const express = require("express");
const { Client } = require("pg");

const PORT = 4001;
console.log("QS DATABASE_URL =", process.env.DATABASE_URL);

const app = express();

app.get("/__dump/products", async (_req, res) => {
  console.log("QS HIT /__dump/products");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const r = await client.query(
      'select * from "Products" order by "createdAt" desc limit 50'
    );
    res.json({
      data: r.rows,
      page: 1,
      limit: 50,
      total: r.rows.length,
      totalPages: 1,
    });
  } catch (e) {
    console.error("QS error:", e);
    res.status(500).json({ error: String(e.message || e) });
  } finally {
    await client.end().catch(() => {});
  }
});

app.listen(PORT, () => console.log(`QS listening on http://127.0.0.1:${PORT}`));
