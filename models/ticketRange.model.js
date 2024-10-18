import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const TicketRange = sequelize.define('TicketRange', {
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
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  number_end: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'TicketRange',
  timestamps: true,
});

export default TicketRange;

