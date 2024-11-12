import { body } from 'express-validator';
import { string } from '../constructor/string.js';
export const validateAdminCreate = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn([string.Admin, string.SubAdmin, string.User])
    .withMessage('Invalid role'),
];

export const validateAdminLogin = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const purchaseTicketValidation = [
  body('generateId').notEmpty().withMessage('Generate ID is required'),
  body('userId').notEmpty().withMessage('User  ID is required'),
  body('userName').notEmpty().withMessage('User name is required').isString().withMessage('User name must be a string'),
];

// export const createTicketValidation = [
//   body('group.min').isInt({ min: 38 }).withMessage('Group must be a positive integer'),
//   body('group.max').isInt({ max: 99 }).withMessage('Group must be a positive integer'),
//   body('group')
//     .custom(({ min, max }) => {
//       if (min > max) {
//         throw new Error('Group minimum cannot be greater than Group maximum');
//       }
//       return true;
//     }),

//   body('series.start').isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),
//   body('series.end').isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),

//   body('number.min').isLength({ min: 5, max: 5 }).withMessage('number.min must be exactly 5 digits').isString({ min: '00000' }).withMessage('Number minimum start with 00000'),
//   body('number.max').isLength({ min: 5, max: 5 }).withMessage('number.max must be exactly 5 digits').isString({ max: '99999' }).withMessage('Maximum number 99999'),
//   body('number')
//     .custom(({ min, max }) => {
//       if (min > max) {
//         throw new Error('Number min cannot be greater than Number max');
//       }
//       return true;
//     }),
// ];

export const searchTicketValidation = [
  body('group').notEmpty().withMessage('Group is required'),
  body('series').notEmpty().withMessage('Series is required').isString().withMessage('Series must be a string'),
  body('number').notEmpty().withMessage('Number is required').isString().withMessage('Series must be a string'),
  body('sem').notEmpty().withMessage('Sem is required'),
];

export const validatePurchaseHistory = [body('userId').isUUID().withMessage('User ID must be a valid UUID.')];

export const validateCreateResult = [
  body('ticketNumber')
    .notEmpty()
    .withMessage('Ticket number is required.')
    .isArray()
    .withMessage('Ticket number must be an array.'),
  body('prizeCategory')
    .notEmpty()
    .withMessage('Prize category is required.')
    .isIn(['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'])
    .withMessage('Invalid prize category.'),
  body('prizeAmount')
    .notEmpty()
    .withMessage('Prize amount is required.')
    .isInt({ min: 1 })
    .withMessage('Prize amount must be a positive integer.'),
  body('announceTime')
    .notEmpty()
    .withMessage('Announce time is required.')
    .isString()
    .withMessage('Announce time must be a string.'),
];

const checkTicketNumberFormat = (prizeCategory) => {
  return (value) => {
    const ticketNumber = value.trim();

    // Validate ticket number based on the prize category
    if (prizeCategory === 'Second Prize') {
      // Second prize should contain only the last 5 digits (e.g., 00001)
      const ticketRegex = /^\d{5}$/;
      return ticketRegex.test(ticketNumber);
    } else if (prizeCategory === 'Third Prize' || prizeCategory === 'Fourth Prize' || prizeCategory === 'Fifth Prize') {
      // Third prize should contain only the last 4 digits (e.g., 0001)
      const ticketRegex = /^\d{4}$/;
      return ticketRegex.test(ticketNumber);
    } else if (prizeCategory === 'First Prize') {
      // First prize can contain the whole ticket number (e.g., 38 A 00001)
      const ticketRegex = /^\d{1,2} [A-Z] \d{5}$/;
      return ticketRegex.test(ticketNumber);
    }
    return false;
  };
};

export const validationRules = [
  body('ticketNumber')
    .isArray()
    .withMessage('Ticket numbers must be an array')
    .custom((value, { req }) => {
      // Validate each ticket number based on prize category
      const valid = value.every((ticket) => checkTicketNumberFormat(req.body.prizeCategory)(ticket));
      if (!valid) {
        throw new Error('Ticket numbers do not match the required format for the selected prize category');
      }
      return true;
    }),
  body('prizeCategory')
    .isIn(['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'])
    .withMessage('Invalid prize category'),
  body('prizeAmount').isNumeric().withMessage('Prize amount must be a number'),
  body('announceTime').isISO8601().withMessage('Announce time must be a valid ISO 8601 timestamp'),
];
