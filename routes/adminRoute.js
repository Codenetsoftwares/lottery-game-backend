import { createAdmin, login } from "../controllers/adminController.js";
import { validateAdminCreate, validateAdminLogin } from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const adminRoutes = (app) => {

    app.post('/api/create-admin',validateAdminCreate, customErrorHandler, createAdmin);
    app.post('/api/login', validateAdminLogin, customErrorHandler, login);
    //  app.post("/api/draw/:lotteryId", lotteryDraw);
      



}