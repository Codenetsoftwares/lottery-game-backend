import { string } from '../constructor/string.js';
import { getAllMarkets } from '../controllers/admin.controller.js';
import { getLotteryResults, getMultipleLotteryResults, getResultByMarketId, ResultDeclare } from '../controllers/ResultDeclaration.js';
import { authorize } from '../middlewares/auth.js';
import { validateMarketId, validationRules } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ResultDeclarationModule = (app) => {
  app.post(
    '/api/admin/results-declaration/:marketId',
    validationRules,
    customErrorHandler,
    authorize([string.Admin,string.checker,string.maker]),
    ResultDeclare,
  );

  app.get('/api/lottery-results/:marketId', validateMarketId, customErrorHandler, getLotteryResults);

  app.get('/api/lottery-results', getMultipleLotteryResults);

  app.get('/api/market-lottery-results/:marketId', getResultByMarketId);

};
