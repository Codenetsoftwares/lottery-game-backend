import { string } from '../constructor/string.js';
import { drawLottery, getDrawTimes, getOldResults, getResults } from '../controllers/resultController.js';
import { authorize } from '../middlewares/auth.js';
import { authenticateUser } from '../middlewares/colorgameAuth.js';
import { validateDrawLottery, validateGetResults } from '../utills/commonSchema.js';
import customErrorHandler from '../utills/customErrorHandler.js';

export const resultRoutes = (app) => {
  app.post(
    '/api/lotteries/draw-lotteries',
    validateDrawLottery,
    customErrorHandler,
    authorize([string.Admin]),
    drawLottery,
  );

  app.get('/api/lotteries/get-result/:resultId', validateGetResults, customErrorHandler, authenticateUser, getResults);

  app.get('/api/lotteries/draw-time', authorize([string.Admin]), getDrawTimes);

  app.get('/api/old-results', getOldResults);
};
