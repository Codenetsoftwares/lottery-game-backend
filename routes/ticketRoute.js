import { string } from '../constructor/string.js';
import { generateTicket } from '../controllers/ticketController.js';
import { authorize } from '../middlewares/auth.js';

export const ticketRoutes = (app) => {
  app.get('/api/generate-tickets/:sem', authorize([string.Admin]), generateTicket);
};
