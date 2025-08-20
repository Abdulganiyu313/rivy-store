import { Sequelize } from "sequelize";
export const sequelize = new Sequelize(
  process.env.DB_NAME || "rivy_store",
  process.env.DB_USER || "rivy",
  process.env.DB_PASS || "rivy",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false,
  }
);
