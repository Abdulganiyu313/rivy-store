"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
class Order extends sequelize_1.Model {
}
exports.Order = Order;
Order.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "placed",
    },
    subtotalKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    taxKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    totalKobo: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    customerName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    customerEmail: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    customerAddress: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: db_1.sequelize, tableName: "orders", underscored: true });
//# sourceMappingURL=Order.js.map