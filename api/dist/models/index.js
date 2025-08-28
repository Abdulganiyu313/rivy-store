"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.OrderItem = exports.Order = exports.Product = exports.Category = void 0;
exports.syncAndSeed = syncAndSeed;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return db_1.sequelize; } });
/* =========================
   Category
   ========================= */
class Category extends sequelize_1.Model {
}
exports.Category = Category;
Category.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: db_1.sequelize, tableName: "Categories", timestamps: true });
/* =========================
   Product
   ========================= */
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    priceKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    stock: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    minOrder: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    brand: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    category: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    imageUrl: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    images: { type: sequelize_1.DataTypes.JSONB, allowNull: true },
    financingEligible: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    categoryId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
}, { sequelize: db_1.sequelize, tableName: "Products", timestamps: true });
/* =========================
   Order
   ========================= */
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: { type: sequelize_1.DataTypes.STRING, defaultValue: "placed" },
    subtotalKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    taxKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    totalKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    name: sequelize_1.DataTypes.STRING,
    email: sequelize_1.DataTypes.STRING,
    address: sequelize_1.DataTypes.STRING,
    currency: sequelize_1.DataTypes.STRING,
}, { sequelize: db_1.sequelize, tableName: "Orders", timestamps: true });
/* =========================
   OrderItem
   ========================= */
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    productId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    unitPriceKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    qty: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    subtotalKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, tableName: "OrderItems", timestamps: true });
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
async function syncAndSeed() {
    await db_1.sequelize.sync({ alter: true });
}
//# sourceMappingURL=index.js.map