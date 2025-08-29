import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import products from "./routes/products";
import orders from "./routes/orders";
import categories from "./routes/categories";
import openapi from "./docs/openapi.json";

export const app = express();

app.set("trust proxy", 1);

const allowOrigins = new Set<string>([
  "https://energystack-web.onrender.com",
  "http://localhost:5173", // keep for local dev
]);

const corsOptions: cors.CorsOptions = {
  origin(origin, cb) {
    if (!origin || allowOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// health
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// routes
app.use("/products", products);
app.use("/api/products", products);
app.use("/checkout", orders);
app.use("/api", orders);
app.use("/categories", categories);

// docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res
    .status(500)
    .json({ error: { code: "SERVER_ERROR", message: "Unexpected error" } });
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
export default app;
