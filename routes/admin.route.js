import { string } from "../constructor/string.js";
import { createAdmin, login } from "../controllers/admin.controller.js";
import { authorize } from "../middlewares/auth.js";
import { validateAdminCreate, validateAdminLogin } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";

export const adminRoutes = (app) => {

    app.post('/api/create-admin', validateAdminCreate, customErrorHandler, createAdmin);
    app.post('/api/login', validateAdminLogin, customErrorHandler, login);




}