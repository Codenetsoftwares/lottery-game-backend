// models/Lottery.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Lottery = sequelize.define(
  "Lottery",
  {
    lotteryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    firstPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPurchased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nonPurchased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "lotteries",
    indexes: [],
  }
);

export default Lottery;
