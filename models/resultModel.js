import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; 
const Result = sequelize.define(
  "Result",
  {
    resultId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    lotteryId: {
      type: DataTypes.UUID, // Assuming lotteryId is a UUID
      allowNull: false,
      references: {
        model: 'lotteries', // Reference the Lottery model
        key: 'lotteryId',   // The key in the Lottery model
      },
    },
    winningTicket: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    firstPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    secondPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    thirdPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fourthPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fifthPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    drawDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "results",
  }
);

export default Result;
