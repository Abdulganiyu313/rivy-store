"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./db");
const models_1 = require("./models");
const logger_1 = require("./logger");
const http_1 = __importDefault(require("http"));
console.log("API DATABASE_URL =", process.env.DATABASE_URL);
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";
const IS_PROD = process.env.NODE_ENV === "production";
const SHOULD_SEED = process.env.SEED === "true" && !IS_PROD; // never seed automatically in prod
app_1.default.get("/__debug/routes", (_req, res) => {
    const stack = app_1.default?._router?.stack ?? [];
    const routes = stack
        .map((l) => (l.route && l.route.path) ||
        (l.name === "router" && l.regexp && l.regexp.toString()))
        .filter(Boolean);
    console.log("Registered routes:", routes);
    res.json({ routes });
});
// PROOF: DB count + first 3 rows
app_1.default.get("/__debug/db", async (_req, res) => {
    const count = await models_1.Product.count();
    const [sample] = await db_1.sequelize.query('select id, name from "Products" order by id asc limit 3');
    res.json({ url: process.env.DATABASE_URL, count, sample });
});
// GUARANTEED: unique path, bypasses routers
app_1.default.get("/__dump/products", async (_req, res) => {
    console.log("HIT /__dump/products (raw SQL)");
    const [rows] = await db_1.sequelize.query('select * from "Products" order by "createdAt" desc limit 50');
    res.json({
        data: rows,
        page: 1,
        limit: 50,
        total: rows.length,
        totalPages: 1,
    });
});
function errToString(e) {
    if (e instanceof Error)
        return e.stack || e.message;
    try {
        return JSON.stringify(e);
    }
    catch {
        return String(e);
    }
}
async function start() {
    try {
        await db_1.sequelize.authenticate();
        logger_1.logger.info("[db] connected");
        if (SHOULD_SEED) {
            await (0, models_1.syncAndSeed)();
            logger_1.logger.info("[db] synced & seeded (dev)");
        }
        app_1.default.get("/healthz", (_req, res) => res.status(200).json({ ok: true, uptime: process.uptime() }));
        // Start HTTP server (keep reference for graceful shutdown)
        const server = http_1.default.createServer(app_1.default);
        server.listen(PORT, HOST, () => {
            logger_1.logger.info(`API listening on http://${HOST}:${PORT}`);
        });
        // Graceful shutdown
        const shutdown = (signal) => async () => {
            try {
                logger_1.logger.warn(`[api] received ${signal}, shutting down...`);
                await new Promise((resolve) => server.close(() => resolve()));
                await db_1.sequelize.close();
                logger_1.logger.info("[api] shutdown complete");
                process.exit(0);
            }
            catch (err) {
                logger_1.logger.error(`[api] shutdown error: ${errToString(err)}`);
                process.exit(1);
            }
        };
        process.on("SIGTERM", shutdown("SIGTERM"));
        process.on("SIGINT", shutdown("SIGINT"));
    }
    catch (err) {
        logger_1.logger.error(`[api] startup failed: ${errToString(err)}`);
        process.exit(1);
    }
}
process.on("unhandledRejection", (err) => {
    logger_1.logger.error(`[api] unhandledRejection: ${errToString(err)}`);
});
process.on("uncaughtException", (err) => {
    logger_1.logger.error(`[api] uncaughtException: ${errToString(err)}`);
    process.exit(1);
});
start();
//# sourceMappingURL=server.js.map