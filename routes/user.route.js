import { string } from '../constructor/string.js';
import {
  dateWiseMarkets,
  getAllMarkets,
  getResult,
  purchaseHistory,
  PurchaseTickets,
  searchTickets,
} from '../controllers/user.controller.js';
import { authenticateUser } from '../middlewares/colorgameAuth.js';
import { purchaseTicketValidation, validateSearchTickets, validatePurchaseHistory, validateGetResult, validateDateQuery } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';

export const userRoute = (app) => {
  app.get('/api/getAll-markets',authenticateUser, getAllMarkets)

  app.post('/api/search-ticket',
    validateSearchTickets,
    customErrorHandler,
    authenticateUser,
     async (req, res) => {
    try {
      const tickets = await searchTickets(req.body);

      return apiResponseSuccess(tickets, true, statusCode.success, 'Success.', res);
    } catch (error) {
      console.error('Error saving ticket range:', error);
      return apiResponseErr(
        null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message,
        res,
      );
    }
  });

  app.post('/api/purchase-lottery/:marketId', purchaseTicketValidation, customErrorHandler, authenticateUser, PurchaseTickets);
  
  app.post('/api/purchase-history/:marketId', validatePurchaseHistory, customErrorHandler, purchaseHistory);

  app.get('/api/prize-results',validateGetResult,customErrorHandler, authenticateUser, getResult);

  app.get('/api/user/dateWise-markets',validateDateQuery,customErrorHandler,authenticateUser, dateWiseMarkets)
};
