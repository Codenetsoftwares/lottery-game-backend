import { string } from "../constructor/string.js";
import { adminPurchaseHistory, adminSearchTickets, createAdmin, login } from "../controllers/admin.controller.js";
import { validateAdminCreate, validateAdminLogin } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const adminRoutes = (app) => {

    app.post('/api/create-admin', validateAdminCreate, customErrorHandler, createAdmin);
    app.post('/api/login', validateAdminLogin, customErrorHandler, login);
    app.post('/api/admin/search-ticket', async (req, res) => {
        try {
            const tickets = await adminSearchTickets(req.body);

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

    app.get('/api/admin/purchase-history', adminPurchaseHistory);



}