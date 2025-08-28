require("dotenv").config({ override: true });
const ssl =
  process.env.DATABASE_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};
module.exports = {
  development: {
    dialect: "postgres",
    logging: false,
    use_env_variable: "DATABASE_URL",
    dialectOptions: ssl,
  },
  test: {
    dialect: "postgres",
    logging: false,
    use_env_variable: "TEST_DATABASE_URL",
    dialectOptions: ssl,
  },
  production: {
    dialect: "postgres",
    logging: false,
    use_env_variable: "DATABASE_URL",
    dialectOptions: ssl,
  },
};
