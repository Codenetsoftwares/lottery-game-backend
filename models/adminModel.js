import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      // Removed unique constraint if it's not necessary
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "subAdmin", "user"),
      allowNull: false,
    },
  },
  {
    indexes: [], // Minimize indexes if possible
  }
);

// Hash password before saving
Admin.beforeCreate(async (admin) => {
  admin.password = await bcrypt.hash(admin.password, 10);
});

// Hash password before updating if it has changed
Admin.beforeUpdate(async (admin) => {
  if (admin.changed("password")) {
    admin.password = await bcrypt.hash(admin.password, 10);
  }
});

// Password comparison method
Admin.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default Admin;
