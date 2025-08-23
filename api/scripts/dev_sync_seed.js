require("dotenv").config();

const { Sequelize, DataTypes } = require("sequelize");

const ssl =
  process.env.DATABASE_SSL === "true"
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: console.log, // set to false if too chatty
  dialectOptions: ssl,
});

// Simple Product model for dev; adjust later to match your real app
const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    minOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    brand: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.TEXT },
    // Postgres JSONB; fine if it ends up JSON in other DBs
    images: { type: DataTypes.JSONB },
  },
  {
    tableName: "Products",
    timestamps: true,
  }
);

(async () => {
  try {
    console.log("Connecting ->", process.env.DATABASE_URL);
    await sequelize.authenticate();
    console.log("Connected ✅");

    // Create/alter tables in DEV
    await sequelize.sync({ alter: true });
    console.log("Schema synced ✅");

    const count = await Product.count();
    if (count === 0) {
      console.log("Seeding sample products…");
      await Product.bulkCreate([
        {
          name: "1kW Solar Kit",
          description: "Starter solar kit; panels + inverter + wiring.",
          price: 250000,
          stock: 25,
          minOrder: 1,
          brand: "SunPrime",
          category: "kits",
          imageUrl: "https://source.unsplash.com/featured/800x600?solar,panel",
          images: [
            "https://source.unsplash.com/featured/800x600?solar,roof",
            "https://source.unsplash.com/featured/800x600?inverter",
          ],
        },
        {
          name: "3kW Hybrid Inverter",
          description: "Pure sine wave, MPPT, Wi-Fi monitoring.",
          price: 410000,
          stock: 15,
          minOrder: 1,
          brand: "VoltX",
          category: "inverters",
          imageUrl:
            "https://source.unsplash.com/featured/800x600?inverter,solar",
        },
        {
          name: "Deep-Cycle Battery 200Ah",
          description: "AGM battery, maintenance-free.",
          price: 185000,
          stock: 40,
          minOrder: 2,
          brand: "PowerCell",
          category: "batteries",
          imageUrl:
            "https://source.unsplash.com/featured/800x600?battery,solar",
        },
        {
          name: "Mono Panel 550W",
          description: "High-efficiency monocrystalline panel.",
          price: 125000,
          stock: 60,
          minOrder: 2,
          brand: "HelioMax",
          category: "panels",
          imageUrl: "https://source.unsplash.com/featured/800x600?solar-panel",
        },
      ]);
      console.log("Seeded ✅");
    } else {
      console.log(`Products already present (${count}), skipping seed.`);
    }

    console.log("Done. You can now query the Products table.");
  } catch (err) {
    console.error("Seed script failed ❌");
    console.error(err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
