"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = exports.Product = exports.Category = void 0;
exports.syncAndSeed = syncAndSeed;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
class Category extends sequelize_1.Model {
}
exports.Category = Category;
Category.init({ name: { type: sequelize_1.DataTypes.STRING, allowNull: false } }, { sequelize: db_1.sequelize, modelName: "Category" });
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    description: sequelize_1.DataTypes.TEXT,
    price: { type: sequelize_1.DataTypes.INTEGER, allowNull: false }, // kobo
    stock: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: sequelize_1.DataTypes.STRING,
    categoryId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, modelName: "Product" });
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    status: { type: sequelize_1.DataTypes.STRING, defaultValue: "placed" },
    subtotal: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    tax: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    total: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, modelName: "Order" });
class OrderItem extends sequelize_1.Model {
}
exports.OrderItem = OrderItem;
OrderItem.init({
    orderId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    productId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    quantity: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    lineTotal: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, modelName: "OrderItem" });
Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
async function syncAndSeed() {
    await db_1.sequelize.sync({ force: true });
    const solar = await Category.create({ name: "Solar Kits" });
    const inverters = await Category.create({ name: "Inverters" });
    await Product.bulkCreate([
        {
            name: "1KW Solar Kit",
            description: "Starter solar kit suitable for small apartments: panels, controller, and basic batteries. Ideal for lights, fans, and phone/laptop charging.",
            price: 2500000,
            stock: 12,
            categoryId: solar.get("id"),
            imageUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop",
        },
        {
            name: "3KW Solar Kit",
            description: "Full home kit: supports TVs, fridge, lighting, and sockets. Includes MPPT controller and higher-capacity batteries.",
            price: 7500000,
            stock: 7,
            categoryId: solar.get("id"),
            imageUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop",
        },
        {
            name: "5KW Inverter",
            description: "Pure sine wave inverter, low noise, high efficiency. Works with existing solar arrays and battery banks.",
            price: 4200000,
            stock: 9,
            categoryId: inverters.get("id"),
            imageUrl: "https://images.unsplash.com/photo-1584270354949-1f19a8b0d3f1?q=80&w=1200&auto=format&fit=crop",
        },
    ]);
}
