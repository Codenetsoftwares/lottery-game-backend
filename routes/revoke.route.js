import { string } from "../constructor/string.js";
import { revokeMarket } from "../controllers/revokeGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import { validateVoidMarket } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";



export const revokeGameRoute = (app) => {
    app.post(
      "/api/revoke-market-lottery",validateVoidMarket,customErrorHandler, authorize([string.Admin]),revokeMarket);
  
  };   