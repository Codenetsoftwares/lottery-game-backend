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
    lotteryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Lottery,
        key: "lotteryId",
      },
    },
    ticketNumber: {
      type: DataTypes.STRING,
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
  },
  {
    tableName: "lottery_purchases",
  }
);

export default LotteryPurchase;
