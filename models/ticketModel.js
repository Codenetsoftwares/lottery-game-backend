// models/Ticket.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true, 
    },
    ticketNumber: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull:false,
      unique: true,
    },
    sem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }

  },
  {
    tableName: "tickets",
  }
);

export default Ticket;
