// models/LotteryPurchase.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Lottery from "../models/lotteryModel.js";

const LotteryPurchase = sequelize.define(
  "LotteryPurchase",
  {
    purchaseId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lotteryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Lottery,
        key: "lotteryId",
      },
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    purchaseAmount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    drawTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "lottery_purchases",
  }
);

export default LotteryPurchase;
