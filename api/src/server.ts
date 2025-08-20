import { app } from "./app";
import { syncAndSeed } from "./models"; // only syncAndSeed comes from models
import { sequelize } from "./db"; // sequelize comes from db
import { logger } from "./logger";

const PORT = process.env.PORT || 4000;
(async () => {
  await sequelize.authenticate();
  if (process.env.SEED !== "false") await syncAndSeed();
  app.listen(PORT, () => logger.info(`API on http://localhost:${PORT}`));
})();
