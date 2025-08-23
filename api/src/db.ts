import { Sequelize } from "sequelize";

const url = process.env.DATABASE_URL;
const useSSL = (process.env.DATABASE_SSL || "false").toLowerCase() === "true";

export const sequelize = url
  ? new Sequelize(url, {
      dialect: "postgres",
      logging: false,
      dialectOptions: useSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
    })
  : new Sequelize(
      process.env.DB_NAME || "rivy_store",
      process.env.DB_USER || "rivy",
      process.env.DB_PASS || "rivy",
      {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        dialect: "postgres",
        logging: false,
        dialectOptions: useSSL
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      }
    );
