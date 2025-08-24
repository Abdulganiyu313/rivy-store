import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export interface OrderAttributes {
  id: number;
  status: string;
  subtotalKobo: number;
  taxKobo: number;
  totalKobo: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type OrderCreationAttributes = Optional<
  OrderAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public status!: string;
  public subtotalKobo!: number;
  public taxKobo!: number;
  public totalKobo!: number;
  public customerName!: string;
  public customerEmail!: string;
  public customerAddress!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "placed",
    },
    subtotalKobo: { type: DataTypes.INTEGER, allowNull: false },
    taxKobo: { type: DataTypes.INTEGER, allowNull: false },
    totalKobo: { type: DataTypes.INTEGER, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerEmail: { type: DataTypes.STRING, allowNull: false },
    customerAddress: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "orders", underscored: true }
);
