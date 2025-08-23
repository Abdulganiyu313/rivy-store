"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const models_1 = require("./models"); // only syncAndSeed comes from models
const db_1 = require("./db"); // sequelize comes from db
const logger_1 = require("./logger");
const PORT = process.env.PORT || 4000;
(async () => {
    await db_1.sequelize.authenticate();
    if (process.env.SEED !== "false")
        await (0, models_1.syncAndSeed)();
    app_1.app.listen(PORT, () => logger_1.logger.info(`API on http://localhost:${PORT}`));
})();
