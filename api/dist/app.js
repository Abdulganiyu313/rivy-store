"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const categories_1 = __importDefault(require("./routes/categories"));
const logger_1 = require("./logger");
const openapi_json_1 = __importDefault(require("./docs/openapi.json"));
exports.app = (0, express_1.default)();
/**
 * Core middleware
 */
const origin = process.env.CORS_ORIGIN || "http://localhost:5173";
exports.app.use((0, cors_1.default)({
    origin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
}));
exports.app.use(express_1.default.json());
exports.app.use((0, helmet_1.default)());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
/**
 * Health
 */
exports.app.get("/health", (_req, res) => res.json({ status: "ok" }));
exports.app.get("/healthz", (_req, res) => res.json({ ok: true }));
/**
 * Routes
 * - Keep your existing bases
 * - Add aliases to match assessment/staging expectations
 */
// Products
exports.app.use("/products", products_1.default); // existing
exports.app.use("/product", products_1.default); // alias (if anything calls /product)
exports.app.use("/api/products", products_1.default); // alias for frontend calls
// Orders / Checkout
exports.app.use("/orders", orders_1.default); // existing base (if you add more later)
exports.app.use("/checkout", orders_1.default); // exposes POST /checkout
exports.app.use("/api", orders_1.default); // exposes POST /api/checkout
// Categories
exports.app.use("/categories", categories_1.default);
// API docs
exports.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_json_1.default));
/**
 * Error handler (keep last)
 */
exports.app.use((err, _req, res, _next) => {
    logger_1.logger.error(err);
    res
        .status(500)
        .json({ error: { code: "SERVER_ERROR", message: "Unexpected error" } });
});
