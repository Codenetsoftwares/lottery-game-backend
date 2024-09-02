import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Lottery from "./lotteryModel.js"; 

const Result = sequelize.define(
  "Result",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lotteryId: {
      type: DataTypes.UUID,
      references: {
        model: Lottery, 
        key: "lotteryId",
      },
      allowNull: false,
    },
    firstPrizeTicket: {
      type: DataTypes.STRING,
    },
    secondPrizeTicket: {
      type: DataTypes.STRING,
    },
    thirdPrizeTicket: {
      type: DataTypes.STRING,
    },
    fourthPrizeTicket: {
      type: DataTypes.STRING,
    },
    fifthPrizeTicket: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "results",
  }
);

export default Result;