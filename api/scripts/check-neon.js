require("dotenv").config();
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const r = await client.query('select count(*)::int as n from "Products"');
  console.log("Neon Products =", r.rows[0].n);
  await client.end();
})();
