"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const Order_1 = require("./Order");
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
}, { sequelize: db_1.sequelize, tableName: "order_items", underscored: true });
// Associations
Order_1.Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
OrderItem.belongsTo(Order_1.Order, { as: "order", foreignKey: "orderId" });
//# sourceMappingURL=OrderItem.js.map