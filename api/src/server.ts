import "dotenv/config";
import app from "./app";
import { sequelize } from "./db";
import { Product, syncAndSeed } from "./models";
import ordersRouter from "./routes/orders";
import { logger } from "./logger";
import http from "http";
console.log("API DATABASE_URL =", process.env.DATABASE_URL);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";
const IS_PROD = process.env.NODE_ENV === "production";
const SHOULD_SEED = process.env.SEED === "true" && !IS_PROD; // never seed automatically in prod

app.get("/__debug/routes", (_req, res) => {
  const stack = (app as any)?._router?.stack ?? [];
  const routes = stack
    .map(
      (l: any) =>
        (l.route && l.route.path) ||
        (l.name === "router" && l.regexp && l.regexp.toString())
    )
    .filter(Boolean);
  console.log("Registered routes:", routes);
  res.json({ routes });
});

// PROOF: DB count + first 3 rows
app.get("/__debug/db", async (_req, res) => {
  const count = await Product.count();
  const [sample] = await sequelize.query(
    'select id, name from "Products" order by id asc limit 3'
  );
  res.json({ url: process.env.DATABASE_URL, count, sample });
});

// GUARANTEED: unique path, bypasses routers
app.get("/__dump/products", async (_req, res) => {
  console.log("HIT /__dump/products (raw SQL)");
  const [rows] = await sequelize.query(
    'select * from "Products" order by "createdAt" desc limit 50'
  );
  res.json({
    data: rows,
    page: 1,
    limit: 50,
    total: (rows as any[]).length,
    totalPages: 1,
  });
});

function errToString(e: unknown) {
  if (e instanceof Error) return e.stack || e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    logger.info("[db] connected");

    if (SHOULD_SEED) {
      await syncAndSeed();
      logger.info("[db] synced & seeded (dev)");
    }

    app.get("/healthz", (_req, res) =>
      res.status(200).json({ ok: true, uptime: process.uptime() })
    );

    // Start HTTP server (keep reference for graceful shutdown)
    const server = http.createServer(app);
    server.listen(PORT, HOST, () => {
      logger.info(`API listening on http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => async () => {
      try {
        logger.warn(`[api] received ${signal}, shutting down...`);
        await new Promise<void>((resolve) => server.close(() => resolve()));
        await sequelize.close();
        logger.info("[api] shutdown complete");
        process.exit(0);
      } catch (err) {
        logger.error(`[api] shutdown error: ${errToString(err)}`);
        process.exit(1);
      }
    };
    process.on("SIGTERM", shutdown("SIGTERM"));
    process.on("SIGINT", shutdown("SIGINT"));
  } catch (err) {
    logger.error(`[api] startup failed: ${errToString(err)}`);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  logger.error(`[api] unhandledRejection: ${errToString(err)}`);
});

process.on("uncaughtException", (err) => {
  logger.error(`[api] uncaughtException: ${errToString(err)}`);
  process.exit(1);
});

start();
