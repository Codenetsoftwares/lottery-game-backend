import { string } from "../constructor/string.js";
import { getRevokeMarkets, revokeMarket } from "../controllers/revokeGame.controller.js";
import { authorize } from "../middlewares/auth.js";
import { validateVoidMarket } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";



export const revokeGameRoute = (app) => {
    app.post("/api/revoke-market-lottery",validateVoidMarket,customErrorHandler, authorize([string.Admin]),revokeMarket);

    app.get("/api/get-revoke-market",getRevokeMarkets)

  };   