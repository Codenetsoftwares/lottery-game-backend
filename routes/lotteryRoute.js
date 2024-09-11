import { string } from "../constructor/string.js";
import {
  createLottery,
  createPurchase,
  getAllLotteries,
  getAllPurchaseLotteries,
  getLotteryById,
  getUserPurchases,
  // purchaseLotteryTicket
} from "../controllers/lotteryController.js";
import { authorize } from "../middlewares/auth.js";
import { validateCreateLottery, validateGetAllLotteries, validateGetLotteryById, validatePurchaseLotteryTicket } from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const lotteryRoutes = (app) => {
  app.post("/api/create-lottery", validateCreateLottery, customErrorHandler, authorize([string.Admin]), createLottery);
  app.get("/api/getAllLotteries", validateGetAllLotteries, customErrorHandler, getAllLotteries);
  app.get("/api/getParticularLotteries/:lotteryId", validateGetLotteryById, customErrorHandler, getLotteryById); //fetch from colorgame
  app.post("/api/create-purchase-lottery",validatePurchaseLotteryTicket,customErrorHandler, createPurchase) //fetch from colorgame
  app.get('/api/user-purchases/:userId', getUserPurchases); //fetch from colorgame not use in lottery admin
  app.get('/api/allPurchase-Lotteries',authorize([string.Admin]), getAllPurchaseLotteries);


};
