import { PurchaseTickets, searchTickets } from "../controllers/user.controller.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const userRoute = (app) => {
    app.post('/api/search-ticket', async (req, res) => {
        try {
            const tickets = await searchTickets(req.body);

            return apiResponseSuccess(tickets, true, statusCode.success, "Success.", res);

        } catch (error) {

            console.error('Error saving ticket range:', error);
            return apiResponseErr(
                null,
                false,
                error.responseCode ?? statusCode.internalServerError,
                error.errMessage ?? error.message,
                res
            )
        }
    });

    app.post('/api/purchase-lottery', PurchaseTickets);
}
