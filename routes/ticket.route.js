import { string } from '../constructor/string.js';
import { geTicketRange, saveTicketRange } from '../controllers/ticket.controller.js';
import { authorize } from '../middlewares/auth.js';
import { validateTicketRange } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ticketRoute = (app) => {
  app.post('/api/generate-ticket', validateTicketRange, customErrorHandler, authorize([string.Admin]), saveTicketRange);
  app.get('/api/get-range', geTicketRange);
};
