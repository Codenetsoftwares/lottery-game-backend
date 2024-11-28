import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const TicketRange = sequelize.define(
  'TicketRange',
  {
    marketId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    group_start: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    group_end: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    series_start: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    series_end: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    number_start: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number_end: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE, 
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'TicketRange',
    timestamps: true,
  }
);

export default TicketRange;