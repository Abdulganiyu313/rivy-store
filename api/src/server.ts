import "dotenv/config";
import app from "./app";
import { sequelize } from "./db";
import { Product, syncAndSeed } from "./models";
import ordersRouter from "./routes/orders";
import { logger } from "./logger";
import http from "http";
import type { Request, Response } from "express";

console.log("API DATABASE_URL =", process.env.DATABASE_URL);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";
const IS_PROD = process.env.NODE_ENV === "production";
const SHOULD_SEED = process.env.SEED === "true" && !IS_PROD; // never seed automatically in prod

async function listOrdersHandler(req: Request, res: Response) {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = (page - 1) * limit;

    const [rows]: any = await sequelize.query(
      'select id, status, "subtotalKobo","taxKobo","totalKobo", name,email,address,currency, "createdAt","updatedAt" from "Orders" order by "createdAt" desc limit $1 offset $2',
      { bind: [limit, offset] }
    );
    const [cnt]: any = await sequelize.query(
      'select count(*)::int as n from "Orders"'
    );
    const total = cnt[0]?.n ?? 0;

    res.json({
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (e: any) {
    console.error("orders list error:", e);
    res.status(500).json({ error: e.message || "orders query failed" });
  }
}

app.get("/orders", listOrdersHandler);
app.get("/api/orders", listOrdersHandler);

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
