import "dotenv/config";
import app from "./app"; // ✅ root app
import { syncAndSeed } from "./models";
import { sequelize } from "./db";
import { logger } from "./logger";

const PORT = process.env.PORT || 4000;

(async () => {
  await sequelize.authenticate();
  if (process.env.SEED !== "false") await syncAndSeed();
  app.listen(PORT, () => logger.info(`API on http://localhost:${PORT}`));
})();
