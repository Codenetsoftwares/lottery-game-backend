import { getLotteryBetHistory } from "../controllers/externalApis.js";

export const ExternalApiModule = (app) => {
    app.post('/api/lottery-external-bet-history', getLotteryBetHistory);

}