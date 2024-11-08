import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const LotteryResult = sequelize.define(
  'LotteryResult',
  {
    resultId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    prizeCategory: {
      type: DataTypes.ENUM('First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'),
      allowNull: false,
    },
    prizeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'LotteryResult',
    timestamps: true,
    freezeTableName: true,
  },
);

export default LotteryResult;
