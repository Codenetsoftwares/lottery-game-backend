import { string } from '../constructor/string.js';
import {
  adminPurchaseHistory,
  adminSearchTickets,
  createAdmin,
  dateWiseMarkets,
  getAllMarkets,
  getInactiveMarket,
  getLiveMarkets,
  getMarkets,
  getResult,
  getTicketNumbersByMarket,
  getTicketRange,
  login,
  updateMarketStatus,
} from '../controllers/admin.controller.js';
import { authorize } from '../middlewares/auth.js';
import { validateAdminLogin, validateAdminPurchaseHistory, validateSearchTickets, validateCreateAdmin, validateDateQuery, validateGetResult, validateMarketId, } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';

export const adminRoutes = (app) => {
  app.post('/api/create-admin', validateCreateAdmin, customErrorHandler, createAdmin);
  app.post('/api/login', validateAdminLogin, customErrorHandler, login);
  app.post(
    '/api/admin/search-ticket',
    validateSearchTickets,
    customErrorHandler,
    authorize([string.Admin]),
    async (req, res) => {
      try {
        const tickets = await adminSearchTickets(req.body);

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
    },
  );

  app.get('/api/admin/purchase-history/:marketId', validateAdminPurchaseHistory, customErrorHandler, authorize([string.Admin]), adminPurchaseHistory);

  app.get('/api/admin/prize-results', validateGetResult, customErrorHandler, authorize([string.Admin]), getResult);

  app.get("/api/tickets/purchases/:marketId", validateMarketId, customErrorHandler, authorize([string.Admin]), getTicketNumbersByMarket)

  app.get('/api/admin/getAll-markets', authorize([string.Admin]), getAllMarkets)

  app.get('/api/admin/dateWise-markets', validateDateQuery, customErrorHandler, authorize([string.Admin]), dateWiseMarkets)

  app.get('/api/admin/get-markets', authorize([string.Admin]), getMarkets)

  app.get('/api/get-live-markets', getLiveMarkets)

  app.get('/api/get-inactive-markets', authorize([string.Admin]), getInactiveMarket)

  app.post('/api/update-market-status', updateMarketStatus)

  app.get("/api/admin/prize-results", authorize([string.Admin]), getResult);

  app.get("/api/admin/ticketRange", getTicketRange)
};
