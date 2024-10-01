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
    .isIn([string.Admin, string.SubAdmin, string.User])
    .withMessage('Invalid role'),
];

export const validateAdminLogin = [
  body("userName").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateCreateLottery = [
  body("name").notEmpty().withMessage("Name is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("firstPrize")
    .isInt({ min: 1 })
    .withMessage("First prize must be a positive integer"),
  body("sem").isInt({ min: 1 }).withMessage("Sem must be a positive integer"),
  body("price")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Price must be a positive integer if provided"),
];



export const validateGetLotteryById = [
  param("lotteryId")
    .isUUID()
    .withMessage("Invalid Lottery ID. Must be a valid UUID."),
];

export const validateEditLottery=[
  param("lotteryId").isUUID().withMessage("Invalid lotteryId. It must be a valid UUID"),
  
  body("name").optional().isString().withMessage("Lottery name must be a string"),
  
  body("date").optional().isISO8601().withMessage("Invalid date format"),
  
  body("firstPrize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("First prize must be an integer greater than 0"),
  
    body("price").optional().isInt({ min: 0 }).withMessage("Price must be an integer"),
];

export const validatePurchaseLotteryTicket = [
  body("userId")
    .isUUID()
    .withMessage("Invalid User ID. Must be a valid UUID."),
  body("lotteryId")
    .isUUID()
    .withMessage("Invalid Lottery ID. Must be a valid UUID."),
];

export const validateGetUserPurchases = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID format. It must be a valid UUID.'),
];

export const validateDrawLottery = [
  body("date").isISO8601().withMessage("Valid date is required")
];

export const validateGetResults = [
  param('resultId')
    .isUUID() 
    .withMessage('Invalid result ID format'),
];