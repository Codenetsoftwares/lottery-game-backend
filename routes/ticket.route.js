import { string } from '../constructor/string.js';
import { geTicketRange, saveTicketRange } from '../controllers/ticket.controller.js';
import { authorize } from '../middlewares/auth.js';
import { createTicketValidation } from '../utils/commonSchema.js';

export const ticketRoute = (app) => {
  app.post('/api/generate-ticket',createTicketValidation, authorize([string.Admin]), saveTicketRange);
  app.get('/api/get-range', geTicketRange);
};
