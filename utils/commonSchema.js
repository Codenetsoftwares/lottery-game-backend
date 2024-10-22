import { body} from "express-validator";
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

export const purchaseTicketValidation = [
  body('generateId')
    .notEmpty().withMessage('Generate ID is required'),
  body('drawDate')
    .notEmpty().withMessage('Draw date is required'),
  body('userId')
    .notEmpty().withMessage('User  ID is required'),
  body('userName')
    .notEmpty().withMessage('User name is required')
    .isString().withMessage('User name must be a string'),
];


export const createTicketValidation = [
  body('group')
      .notEmpty().withMessage('Group is required')
      .isInt({ min: 38, max: 99 }).withMessage('Group must be an integer between 38 and 99'),
  body('series')
      .notEmpty().withMessage('Series is required')
      .custom((value) => {
          const allowedSeries = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L'];
          if (!allowedSeries.includes(value.toUpperCase())) {
              throw new Error('Series must be one of the following: A, B, C, D, E, G, H, J, K, L');
          }
          return true;
      }),
  body('number')
      .notEmpty().withMessage('Number is required')
      .isString().withMessage('Number must be a string'),
  body('sem')
      .notEmpty().withMessage('Sem is required')
      .custom((value) => {
          const allowedSem = [5, 10, 25, 50, 100, 200];
          if (!allowedSem.includes(parseInt(value))) {
              throw new Error('Sem must be one of the following: 5, 10, 25, 50, 100, 200');
          }
          return true;
      }),
];
