// models/Lottery.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Ticket from "./ticketModel.js";

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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    firstPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    secondPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thirdPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fourthPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fifthPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "lotteries",
  }
);

export default Lottery;
