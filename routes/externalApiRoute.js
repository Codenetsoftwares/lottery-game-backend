import { getAllExternalLotteries } from '../controllers/externalApiController.js';
import customErrorHandler from '../utills/customErrorHandler.js';

export const externalApiRoute = (app) => {
  app.get('/api/get-external-lotteries', customErrorHandler, getAllExternalLotteries);
};
