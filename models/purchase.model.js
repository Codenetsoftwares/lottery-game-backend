import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { v4 as uuidv4 } from "uuid";

const PurchaseLottery = sequelize.define('PurchaseLottery', {
    purchaseId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: uuidv4()
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
    drawDate: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, {
    tableName: 'PurchaseLottery',
    timestamps: true,
});

export default PurchaseLottery;

