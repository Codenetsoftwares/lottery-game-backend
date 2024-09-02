// models/Ticket.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Lottery from "./lotteryModel.js"; 

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lotteryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Lottery, 
        key: "lotteryId",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "tickets",
  }
);

export default Ticket;