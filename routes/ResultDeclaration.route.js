import { string } from '../constructor/string.js';
import { getAllMarkets } from '../controllers/admin.controller.js';
import { getLotteryResults, ResultDeclare } from '../controllers/ResultDeclaration.js';
import { authorize } from '../middlewares/auth.js';
import { validationRules } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const ResultDeclarationModule = (app) => {
  app.post(
    '/api/admin/results-declaration/:marketId',
    validationRules,
    customErrorHandler,
    authorize([string.Admin]),
    ResultDeclare,
  );

  app.get('/api/lottery-results/:marketId', getLotteryResults);

};
