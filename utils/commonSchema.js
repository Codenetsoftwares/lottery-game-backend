import { body } from "express-validator";
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
  body('group.min').isInt({ min: 38 }).withMessage('Group must be a positive integer'),
  body('group.max').isInt({ max: 99 }).withMessage('Group must be a positive integer'),
  body('group')
    .custom(({ min, max }) => {
      if (min > max) {
        throw new Error('Group minimum cannot be greater than Group maximum');
      }
      return true;
    }),

  body('series.start').isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
    .withMessage('Series must be between A and L'),
  body('series.end').isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
    .withMessage('Series must be between A and L'),

  body('number.min').isLength({ min: 5, max: 5 }).withMessage('number.min must be exactly 5 digits').isString({ min: '00000' }).withMessage('Number minimum start with 00000'),
  body('number.max').isLength({ min: 5, max: 5 }).withMessage('number.max must be exactly 5 digits').isString({ max: '99999' }).withMessage('Maximum number 99999'),
  body('number')
    .custom(({ min, max }) => {
      if (min > max) {
        throw new Error('Number min cannot be greater than Number max');
      }
      return true;
    }),
];

export const searchTicketValidation = [
  body('group')
    .notEmpty().withMessage('Group is required'),
  body('series')
    .notEmpty().withMessage('Series is required')
    .isString()
    .withMessage('Series must be a string'),
  body('number')
    .notEmpty().withMessage('Number is required')
    .isString()
    .withMessage('Series must be a string'),
  body('sem')
    .notEmpty().withMessage('Sem is required')

];

export const validatePurchaseHistory = [
  body('userId').isUUID().withMessage('User ID must be a valid UUID.'),
];


export const validateCreateResult = [
  body('ticketNumber')
    .exists().withMessage('Ticket number is required.')
    .isArray().withMessage('Ticket number must be an array.')
    .custom((value) => {
      if (!value.every((item) => typeof item === 'string')) {
        throw new Error('Each ticket number must be a string.');
      }
      return true;
    }),
  body('prizeCategory')
    .exists().withMessage('Prize category is required.')
    .isString().withMessage('Prize category must be a string.'),
  body('prizeAmount')
    .exists().withMessage('Prize amount is required.')
    .isNumeric().withMessage('Prize amount must be a number.'),
];
