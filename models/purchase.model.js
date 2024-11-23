import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const PurchaseLottery = sequelize.define(
  'PurchaseLottery',
  {
    purchaseId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4(),
    },
    generateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    series: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marketId : {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lotteryPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    tableName: "PurchaseLottery",
    timestamps: true,
  }
);

export default PurchaseLottery;