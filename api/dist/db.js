"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const url = process.env.DATABASE_URL;
const useSSL = (process.env.DATABASE_SSL || "false").toLowerCase() === "true";
exports.sequelize = url
    ? new sequelize_1.Sequelize(url, {
        dialect: "postgres",
        logging: false,
        dialectOptions: useSSL
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
    })
    : new sequelize_1.Sequelize(process.env.DB_NAME || "rivy_store", process.env.DB_USER || "rivy", process.env.DB_PASS || "rivy", {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        dialect: "postgres",
        logging: false,
        dialectOptions: useSSL
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
    });
//# sourceMappingURL=db.js.map