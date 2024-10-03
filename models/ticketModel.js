import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tickets',
    indexes: [], // Ensure no indexes are created for the JSON column
  },
);

export default Ticket;
