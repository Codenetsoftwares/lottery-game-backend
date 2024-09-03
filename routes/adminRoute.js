import { string } from "../constructor/string.js";
import { createAdmin, login, lotteryDraw } from "../controllers/adminController.js";
import { authorize } from "../middlewares/auth.js";
import { validateAdminCreate, validateAdminLogin } from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const adminRoutes = (app) => {

    app.post('/api/create-admin', validateAdminCreate, customErrorHandler, authorize([string.Admin]), createAdmin);
    app.post('/api/login', validateAdminLogin, customErrorHandler, login);
    app.post("/api/draw/:lotteryId", authorize([string.Admin]), lotteryDraw);




}