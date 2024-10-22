import { saveTicketRange } from "../controllers/ticket.controller.js"
import { createTicketValidation } from "../utils/commonSchema.js"
import customErrorHandler from "../utils/customErrorHandler.js"


export const ticketRoute = (app) => {
    app.post('/api/generate-ticket', createTicketValidation, customErrorHandler, authorize([string.Admin]), saveTicketRange)
}