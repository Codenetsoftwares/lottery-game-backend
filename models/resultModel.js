import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const LotteryResult = sequelize.define(
  "LotteryResult",
  {
    resultId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    prizeCategory: {
      type: DataTypes.ENUM(
        "First Prize",
        "Second Prize",
        "Third Prize",
        "Fourth Prize",
        "Fifth Prize"
      ),
      allowNull: false,
    },
    prizeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    announceTime:{
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "LotteryResult",
    timestamps: true,
    freezeTableName: true,
  }
);

export default LotteryResult;
