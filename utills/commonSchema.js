import { body, param, query, checkSchema } from "express-validator";
import { string } from "../constructor/string.js";
export const validateAdminCreate = [
  body("userName").notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([string.Admin])
    .withMessage('Invalid role. Must be Admin"'),
];

export const validateAdminLogin = [
  body("userName").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

