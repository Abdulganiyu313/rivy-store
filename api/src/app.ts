import express from "express";
import cors from "cors";
import categories from "./routes/categories";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import products from "./routes/products";
import orders from "./routes/orders";
import { logger } from "./logger";
import swaggerUi from "swagger-ui-express";
import openapi from "./docs/openapi.json";

export const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/products", products);
app.use("/orders", orders);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/categories", categories);

app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error(err);
  res
    .status(500)
    .json({ error: { code: "SERVER_ERROR", message: "Unexpected error" } });
});
