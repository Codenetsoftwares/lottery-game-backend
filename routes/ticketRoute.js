import { generateTicket } from '../controllers/ticketController.js';
import { authenticateUser } from '../middlewares/colorgameAuth.js';

export const ticketRoutes = (app) => {
  app.post('/api/generate-tickets/:sem',authenticateUser, generateTicket);
};
