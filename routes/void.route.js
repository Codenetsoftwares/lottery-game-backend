import { getVoidMarkets, voidMarket } from "../controllers/voidGame.controller.js";
import { validateVoidMarket } from "../utils/commonSchema.js";
import customErrorHandler from '../utils/customErrorHandler.js';
import { authorize } from '../middlewares/auth.js';
import { string } from "../constructor/string.js";


export const voidGameRoute = (app) => {
  app.post(
    "/api/void-market-lottery",validateVoidMarket,customErrorHandler, authorize([string.Admin]),voidMarket);

   app.get("/api/get-void-market",getVoidMarkets) 

};