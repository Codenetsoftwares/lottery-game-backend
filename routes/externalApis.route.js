import { getLotteryBetHistory } from "../controllers/externalApis.js";
import { authenticateUser } from "../middlewares/colorgameAuth.js";
import { validateGetLotteryBetHistory } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";

export const ExternalApiModule = (app) => {
    app.post('/api/lottery-external-bet-history', validateGetLotteryBetHistory, customErrorHandler, authenticateUser, getLotteryBetHistory);

}