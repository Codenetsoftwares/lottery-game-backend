import { createTicket, getAllTickets, getTicketById } from "../controllers/ticketController.js";
//import { validatePurchaseTicket } from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const ticketRoutes = (app) => {
  app.post(
    "/api/ticket-create",
    //validatePurchaseTicket,
    //customErrorHandler,
    createTicket
  );

  //pending pagination , search filter ,validation,auth
  app.get("/api/getAllTicket",getAllTickets)

  app.get("/api/getParticularTicket/:id",getTicketById)
};
