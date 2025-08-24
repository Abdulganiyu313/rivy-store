import "dotenv/config";
import app from "./app";
import { sequelize } from "./db";
import { syncAndSeed } from "./models";
import ordersRouter from "./routes/orders";
import { logger } from "./logger";

const PORT = Number(process.env.PORT) || 4000;

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

    if (process.env.SEED !== "false") {
      await syncAndSeed();
      logger.info("[db] synced (alter=true)");
    }

    app.use("/api", ordersRouter);

    app.listen(PORT, () => {
      logger.info(`API on http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(`[api] startup failed: ${errToString(err)}`);
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  logger.error(`[api] unhandledRejection: ${errToString(err)}`);
});

start();
