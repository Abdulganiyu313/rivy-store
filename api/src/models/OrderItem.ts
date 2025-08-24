import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";
import { Order } from "./Order";

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  unitPriceKobo: number;
  qty: number;
  createdAt?: Date;
  updatedAt?: Date;
}
type OrderItemCreationAttributes = Optional<
  OrderItemAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public name!: string;
  public unitPriceKobo!: number;
  public qty!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    unitPriceKobo: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, tableName: "order_items", underscored: true }
);

// Associations
Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { as: "order", foreignKey: "orderId" });
