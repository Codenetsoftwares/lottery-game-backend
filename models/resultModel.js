import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { approval } from '../constructor/string.js';

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
    complementaryPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    checkerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    makerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isRevoke : {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(
        approval.Pending,
        approval.Tally,
        approval.Paid,
        approval.Rejected,
      ),
      defaultValue: approval.Pending,
    },
  },
  {
    tableName: 'LotteryResult',
    timestamps: true,
    freezeTableName: true,
  },
);

export default LotteryResult;
