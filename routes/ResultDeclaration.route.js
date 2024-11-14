import { string } from '../constructor/string.js';
import { ResultDeclare } from '../controllers/ResultDeclaration.js';
import { authorize } from '../middlewares/auth.js';
// import { validationRules } from '../utils/commonSchema.js';
// import customErrorHandler from '../utils/customErrorHandler.js';

export const ResultDeclarationModule = (app) => {
  app.post(
    '/api/admin/results-declaration/:marketId',
    // validationRules,
    // customErrorHandler,
    authorize([string.Admin]),
    ResultDeclare,
  );
};
