import { string } from "../constructor/string.js";
import { createTicket} from "../controllers/ticketController.js";
import { authorize } from "../middlewares/auth.js";


export const ticketRoutes = (app) => {
  app.post("/api/ticket-create",authorize([string.Admin]),createTicket);

};
