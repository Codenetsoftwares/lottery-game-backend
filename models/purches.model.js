import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../db.js';

const PurchaseTicket = sequelize.define('PurchaseTicket', {
  tickets: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  sem : {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  drawTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'PurchaseTicket',
  timestamps: true,
});

export default PurchaseTicket;

