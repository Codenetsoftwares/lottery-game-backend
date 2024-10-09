import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Result = sequelize.define(
  'Result',
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
        key: 'lotteryId', // The key in the Lottery model
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
    firstPrizeAmount: {
      type: DataTypes.DECIMAL(15, 2), // To store 1 crore (10 million) with precision for money
      allowNull: false,
      defaultValue: 10000000.0, // 1 crore = 10,000,000
    },
    secondPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    secondPrizeAmountPerSem: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 9000.0, // 9000 rs per sem
    },
    thirdPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    thirdPrizeAmountPerSem: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 450.0, // 450 rs per sem
    },
    fourthPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fourthPrizeAmountPerSem: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 250.0, // 250 rs per sem
    },
    fifthPrizeWinners: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fifthPrizeAmountPerSem: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 120.0, // 120 rs per sem
    },
    drawDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    drawTime: {
      type: DataTypes.ENUM('10:00 A.M.', '1:00 P.M.', '6:00 P.M.', '8:00 P.M.'),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'results',
  },
);

export default Result;
