import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { v4 as uuidv4 } from "uuid";

const UserRange = sequelize.define('UserRange', {
    generateId :{
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue : uuidv4()
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
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sem: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

}, {
    tableName: 'UserRange',
    timestamps: true,
});

export default UserRange;
