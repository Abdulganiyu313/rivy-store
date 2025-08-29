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
async function listOrdersHandler(req, res) {
    try {
        const limit = Math.min(100, Number(req.query.limit) || 20);
        const page = Math.max(1, Number(req.query.page) || 1);
        const offset = (page - 1) * limit;
        const [rows] = await db_1.sequelize.query('select id, status, "subtotalKobo","taxKobo","totalKobo", name,email,address,currency, "createdAt","updatedAt" from "Orders" order by "createdAt" desc limit $1 offset $2', { bind: [limit, offset] });
        const [cnt] = await db_1.sequelize.query('select count(*)::int as n from "Orders"');
        const total = cnt[0]?.n ?? 0;
        res.json({
            data: rows,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    }
    catch (e) {
        console.error("orders list error:", e);
        res.status(500).json({ error: e.message || "orders query failed" });
    }
}
app_1.default.get("/orders", listOrdersHandler);
app_1.default.get("/api/orders", listOrdersHandler);
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