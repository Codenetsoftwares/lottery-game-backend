import { saveTicketRange } from "../controllers/ticket.controller.js"


export const ticketRoute = (app) => {
    app.post('/api/generate-ticket', saveTicketRange)
}