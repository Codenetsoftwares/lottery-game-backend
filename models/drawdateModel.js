import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const DrawDate = sequelize.define(
  'DrawDate',
  {
    drawId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    drawDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'DrawDate',
    timestamps: true,
  },
);

export default DrawDate;
