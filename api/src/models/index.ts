import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../db";

/* =========================
   Category
   ========================= */
export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;
  declare name: string;
}
Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "Categories", timestamps: true }
);

/* =========================
   Product
   ========================= */
export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare priceKobo: number; // stored in kobo
  declare stock: number;
  declare minOrder: number;
  declare brand: string | null;
  declare category: string | null;
  declare imageUrl: string | null;
  declare images: string[] | null;
  declare financingEligible: boolean | null;
  declare categoryId: number | null;
}
Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priceKobo: { type: DataTypes.INTEGER, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    minOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    brand: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    imageUrl: { type: DataTypes.TEXT, allowNull: true },
    images: { type: DataTypes.JSONB, allowNull: true },
    financingEligible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: "Products", timestamps: true }
);

/* =========================
   Order
   ========================= */
export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<number>;
  declare status: string;
  declare subtotalKobo: number;
  declare taxKobo: number;
  declare totalKobo: number;
  declare name?: string | null;
  declare email?: string | null;
  declare address?: string | null;
  declare currency?: string | null;
}
Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: { type: DataTypes.STRING, defaultValue: "placed" },
    subtotalKobo: { type: DataTypes.INTEGER, allowNull: false },
    taxKobo: { type: DataTypes.INTEGER, allowNull: false },
    totalKobo: { type: DataTypes.INTEGER, allowNull: false },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    currency: DataTypes.STRING,
  },
  { sequelize, tableName: "Orders", timestamps: true }
);

/* =========================
   OrderItem
   ========================= */
export class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare productId: number;
  declare name: string;
  declare unitPriceKobo: number;
  declare qty: number;
  declare subtotalKobo: number;
}
OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    unitPriceKobo: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    subtotalKobo: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "OrderItems", timestamps: true }
);

/* =========================
   Associations (single source of truth)
   ========================= */

// Category ↔ Product
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "categoryRef" });

// Order ↔ OrderItem
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items", // ⚠ keep this alias — routes use include { as: "items" }
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Product ↔ OrderItem (optional but handy for admin)
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

/* =========================
   Utilities / Exports
   ========================= */

export async function syncAndSeed() {
  // ok for dev; use migrations in prod
  await sequelize.sync({ alter: true });
}

// allow `import { sequelize, Order, OrderItem, Product } from "../models"`
export { sequelize };
