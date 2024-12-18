import {
  dateWiseMarkets,
  getAllMarkets,
  getMarkets,
  getResult,
  purchaseHistory,
  PurchaseTickets,
  searchTickets,
} from '../controllers/user.controller.js';
import { authenticateUser } from '../middlewares/colorgameAuth.js';
import { purchaseTicketValidation, validateSearchTickets, validatePurchaseHistory, validateGetResult, validateDateQuery } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const userRoute = (app) => {
  //Done
  app.get('/api/getAll-markets', authenticateUser, getAllMarkets)

  app.post('/api/search-ticket',validateSearchTickets,customErrorHandler,authenticateUser,searchTickets);

  app.post('/api/purchase-lottery/:marketId', purchaseTicketValidation, customErrorHandler, authenticateUser, PurchaseTickets);

  app.post('/api/purchase-history/:marketId', validatePurchaseHistory, customErrorHandler, purchaseHistory);

  //app.get('/api/prize-results', validateGetResult, customErrorHandler, authenticateUser, getResult);

  app.get('/api/user/dateWise-markets', validateDateQuery, customErrorHandler, authenticateUser, dateWiseMarkets)

  app.get('/api/user/get-markets', authenticateUser, getMarkets)

};
