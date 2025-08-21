import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Category extends Model {}
Category.init(
  { name: { type: DataTypes.STRING, allowNull: false } },
  { sequelize, modelName: "Category" }
);

export class Product extends Model {}
Product.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.INTEGER, allowNull: false }, // kobo
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: DataTypes.STRING,
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "Product" }
);

export class Order extends Model {}
Order.init(
  {
    status: { type: DataTypes.STRING, defaultValue: "placed" },
    subtotal: { type: DataTypes.INTEGER, allowNull: false },
    tax: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "Order" }
);

export class OrderItem extends Model {}
OrderItem.init(
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.INTEGER, allowNull: false },
    lineTotal: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "OrderItem" }
);

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

export async function syncAndSeed() {
  await sequelize.sync({ force: true });

  const solar = await Category.create({ name: "Solar Kits" });
  const inverters = await Category.create({ name: "Inverters" });

  await Product.bulkCreate([
    {
      name: "1KW Solar Kit",
      description:
        "Starter solar kit suitable for small apartments: panels, controller, and basic batteries. Ideal for lights, fans, and phone/laptop charging.",
      price: 2500000,
      stock: 12,
      categoryId: solar.get("id") as number,
      imageUrl:
        "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "3KW Solar Kit",
      description:
        "Full home kit: supports TVs, fridge, lighting, and sockets. Includes MPPT controller and higher-capacity batteries.",
      price: 7500000,
      stock: 7,
      categoryId: solar.get("id") as number,
      imageUrl:
        "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "5KW Inverter",
      description:
        "Pure sine wave inverter, low noise, high efficiency. Works with existing solar arrays and battery banks.",
      price: 4200000,
      stock: 9,
      categoryId: inverters.get("id") as number,
      imageUrl:
        "https://images.unsplash.com/photo-1584270354949-1f19a8b0d3f1?q=80&w=1200&auto=format&fit=crop",
    },
  ]);
}
