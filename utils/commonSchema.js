import { body,query,param } from 'express-validator';
import { string } from '../constructor/string.js';

export const validateCreateAdmin = [
  body('userName').notEmpty().withMessage('Username is required').isString().withMessage('Username must be a string'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').notEmpty().withMessage('Role is required').isIn([string.Admin, string.SubAdmin, string.User]).withMessage('Role must be admin, subAdmin, or user'),
];
   
export const validateAdminLogin = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];



export const validateTicketRange = [
  body('group.min').notEmpty().withMessage('Group min is required')
    .isInt({ min: 1, max: 99 })
    .withMessage('Group min must be an integer between 1 and 99')
    ,
  
  body('group.max').notEmpty().withMessage('Group max is required')
    .isInt({ min: 10, max: 99 })
    .withMessage('Group max must be an integer between 10 and 99')
    ,
    body()
    .custom(({ group }) => {
      if (!group || group.min === undefined || group.max === undefined) {
        throw new Error('Group min and max are required.');
      }
      if (group.min >= group.max) {
        throw new Error('Group min must be less than Group max.');
      }
      if (group.max - group.min < 10) {
        throw new Error('Group range must include at least 10 numbers. Please select a valid range.');
      }
      return true;
    }),
  body('series')
  .notEmpty().withMessage('Series is required')
    .custom((series) => {
      const seriesStartCode = series.start.charCodeAt(0);
      const seriesEndCode = series.end.charCodeAt(0);
      const seriesRange = seriesEndCode - seriesStartCode + 1;

      if (seriesRange < 10) {
        throw new Error('Series must have a minimum range of 10');
      }
      return true;
    }).withMessage('Series must have a start and end range'),
  
  body('number.min').notEmpty().withMessage('Number min is required')
    .isLength({ min: 5, max: 5 })
    .isNumeric()
    .withMessage('Number min must be a 5-digit numeric string')
    ,
  
  body('number.max').notEmpty().withMessage('Number max is required')
    .isLength({ min: 5, max: 5 })
    .isNumeric()
    .withMessage('Number max must be a 5-digit numeric string')
    ,
    body()
    .custom(({ number }) => {
      if (number.min >= number.max) {
        throw new Error('Number min must be less than Number max');
      }
      return true;
    }),
  body('start_time').notEmpty().withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date')
    ,
  
  body('end_time').notEmpty().withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date')
    ,
    body()
    .custom((fields) => {
      const { start_time, end_time } = fields;
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);

      if (startTime >= endTime) {
        throw new Error('Start time must be before End time');
      }

      const startHours = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const startAMPM = startHours < 12 ? 'AM' : 'PM';

      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      const endAMPM = endHours < 12 ? 'AM' : 'PM';

      if (startAMPM === endAMPM && startHours === endHours && startMinutes === endMinutes) {
        throw new Error('Start time and End time cannot be identical');
      }

      return true;
    }),


  
  body('marketName')
    .notEmpty()
    .withMessage('Market name is required'),
  
  body('date').notEmpty().withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date')
    ,
  
    body('price')
    .exists()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Price must be greater than 0'),
];


export const validateSearchTickets = [
  body('group').notEmpty().withMessage('Group is required').isInt({ min: 0 }).withMessage('Group must be a positive integer'),
  body('series').notEmpty().withMessage('Series is required').isLength({ min: 1, max: 1 }).withMessage('Series must be a single character'),
  body('number').notEmpty().withMessage('Number is required').isString().isLength({ min: 1 }).withMessage('Number must be a non-empty string'),
  body('sem')
  .notEmpty()
  .withMessage('Sem is required')
  .bail() 
  .isNumeric()
  .withMessage('Sem must be a numeric value')
  .bail() 
  .isIn([5, 10, 25, 50, 100, 200])
  .withMessage('Sem must be one of the following values: 5, 10, 25, 50, 100, 200'),
  body('marketId').notEmpty().withMessage('marketId is required').isUUID().withMessage('MarketId must be a valid UUID'),

];

export const validateAdminPurchaseHistory = [
  query('sem').optional().isNumeric().withMessage('Sem must be a numeric value'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  param("marketId").isUUID().withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateMarketId = [
  param("marketId").notEmpty().withMessage('marketId is required')
    .isUUID()
    .withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateDateQuery = [
  query("date")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format. Use ISO8601 (YYYY-MM-DD)."),
];

export const validateGetResult = [
  query('announce').notEmpty()
  .withMessage('announce is required')
    .optional()
    .isISO8601()
    .withMessage('Announce time must be a valid ISO8601 date.'),
];



export const validateGetTicketNumbersByMarket = [
  param('marketId')
    .notEmpty()
    .withMessage('Market ID is required')
    .isUUID()
    .withMessage('Market ID must be a valid UUID'),
];


export const purchaseTicketValidation = [
  body('generateId').notEmpty().withMessage('Generate ID is required'),
  body('userId').notEmpty().withMessage('User  ID is required'),
  body('userName').notEmpty().withMessage('User name is required').isString().withMessage('User name must be a string'),
];

// export const createTicketValidation = [
//   body('group.min').isInt({ min: 38 }).withMessage('Group must be a positive integer'),
//   body('group.max').isInt({ max: 99 }).withMessage('Group must be a positive integer'),
//   body('group').custom(({ min, max }) => {
//     if (min > max) {
//       throw new Error('Group minimum cannot be greater than Group maximum');
//     }
//     return true;
//   }),

//   body('series.start')
//     .isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),
//   body('series.end')
//     .isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),

//   body('number.min')
//     .isLength({ min: 5, max: 5 })
//     .withMessage('number.min must be exactly 5 digits')
//     .isString({ min: '00000' })
//     .withMessage('Number minimum start with 00000'),
//   body('number.max')
//     .isLength({ min: 5, max: 5 })
//     .withMessage('number.max must be exactly 5 digits')
//     .isString({ max: '99999' })
//     .withMessage('Maximum number 99999'),
//   body('number').custom(({ min, max }) => {
//     if (min > max) {
//       throw new Error('Number min cannot be greater than Number max');
//     }
//     return true;
//   }),
// ];

// export const searchTicketValidation = [
//   body('group').notEmpty().withMessage('Group is required'),
//   body('series').notEmpty().withMessage('Series is required').isString().withMessage('Series must be a string'),
//   body('number').notEmpty().withMessage('Number is required').isString().withMessage('Series must be a string'),
//   body('sem').notEmpty().withMessage('Sem is required'),
// ];

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
    .withMessage('Prize amount must be a positive integer.')
];

// export const validateMarketIds =[ body('marketIds')
// .notEmpty().withMessage('marketIds is required')   
// .isArray().withMessage('marketIds must be an array')  
// .custom((value) => value.length > 0).withMessage('marketIds must contain at least one market ID')  
// ];

// const checkTicketNumberFormat = (prizeCategory) => {
//   return (value) => {
//     const ticketNumber = value.trim();

//     // Validate ticket number based on the prize category
//     if (prizeCategory === 'Second Prize') {
//       // Second prize should contain only the last 5 digits (e.g., 00001)
//       const ticketRegex = /^\d{5}$/;
//       return ticketRegex.test(ticketNumber);
//     } else if (prizeCategory === 'Third Prize' || prizeCategory === 'Fourth Prize' || prizeCategory === 'Fifth Prize') {
//       // Third prize should contain only the last 4 digits (e.g., 0001)
//       const ticketRegex = /^\d{4}$/;
//       return ticketRegex.test(ticketNumber);
//     } else if (prizeCategory === 'First Prize') {
//       // First prize can contain the whole ticket number (e.g., 38 A 00001)
//       const ticketRegex = /^\d{1,2} [A-Z] \d{5}$/;
//       return ticketRegex.test(ticketNumber);
//     }
//     return false;
//   };
// };

export const validationRules = [
  body('*.ticketNumber') 
    .isArray()
    .withMessage('Ticket number must be an array.')
    .bail()
    .custom((ticketNumbers, { req }) => {
      const prizeCategory = req.body.find((entry) => entry.ticketNumber === ticketNumbers)?.prizeCategory;

      if (!prizeCategory) {
        throw new Error('Prize category is required for ticket validation.');
      }

      const prizeLimits = {
        'First Prize': 1,
        'Second Prize': 10,
        'Third Prize': 10,
        'Fourth Prize': 10,
        'Fifth Prize': 50,
      };

      if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
        throw new Error(
          `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`
        );
      }

      ticketNumbers.forEach((ticketNumber) => {
        if (!validateTicketNumber(ticketNumber, prizeCategory)) {
          throw new Error(
            `Invalid ticket number format for ${prizeCategory}: ${ticketNumber}`
          );
        }
      });

      const ticketSet = new Set(ticketNumbers);
      if (ticketSet.size !== ticketNumbers.length) {
        throw new Error('Ticket numbers must be unique within each prize category.');
      }

      return true;
    }),

  body('*.prizeCategory')
    .isIn([
      'First Prize',
      'Second Prize',
      'Third Prize',
      'Fourth Prize',
      'Fifth Prize',
    ])
    .withMessage('Invalid prize category.'),

  body('*.prizeAmount')
    .isFloat({ min: 0 })
    .withMessage('Prize amount must be a valid number greater than 0.'),

  body('*.complementaryPrize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Complementary prize must be a valid number greater than 0.'),
];

// Helper function to validate ticket number based on prize category
function validateTicketNumber(ticketNumber, prizeCategory) {
  const trimmedNumber = ticketNumber.trim();

  if (prizeCategory === 'Second Prize') {
    // Second prize: last 5 digits (e.g., 00001)
    const ticketRegex = /^\d{5}$/;
    return ticketRegex.test(trimmedNumber);
  } else if (
    ['Third Prize', 'Fourth Prize', 'Fifth Prize'].includes(prizeCategory)
  ) {
    // Third, Fourth, Fifth prize: last 4 digits (e.g., 0001)
    const ticketRegex = /^\d{4}$/;
    return ticketRegex.test(trimmedNumber);
  } else if (prizeCategory === 'First Prize') {
    // First prize: whole ticket number (e.g., 38 A 00001)
    const ticketRegex = /^\d{1,2} [A-Z] \d{5}$/;
    return ticketRegex.test(trimmedNumber);
  }
  return false;
}

export const validateVoidMarket = [
  body('marketId')
    .notEmpty().withMessage('Market ID is required')
    .isUUID().withMessage('Market ID must be a valid UUID'),
];

