import { string } from "../constructor/string.js";
import {
  createLottery,
  createPurchase,
  deleteLottery,
  deleteNonPurchasedLotteries,
  editLottery,
  getAllLotteries,
  getAllPurchaseLotteries,
  getLotteryById,
  getUserPurchases,
} from "../controllers/lotteryController.js";
import { authorize } from "../middlewares/auth.js";
import { authenticateUser } from "../middlewares/colorgameAuth.js";
import {
  validateCreateLottery,
  validateEditLottery,
  validateGetLotteryById,
  validateGetUserPurchases,
  validatePurchaseLotteryTicket,
} from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const lotteryRoutes = (app) => {
  app.post(
    "/api/create-lottery",
    validateCreateLottery,
    customErrorHandler,
    authorize([string.Admin]),
    createLottery
  );

  app.get("/api/getAllLotteries", authorize([string.Admin]), getAllLotteries);

  app.delete(
    "/api/lotteries/delete-non-purchased",
    authorize([string.Admin]),
    deleteNonPurchasedLotteries
  );

  app.get(
    "/api/getParticularLotteries/:lotteryId",
    validateGetLotteryById,
    customErrorHandler,
    authenticateUser,
    getLotteryById
  ); //fetch  colorgame

app.put("/api/edit-particularLottery/:lotteryId",validateEditLottery,customErrorHandler,authorize([string.Admin]),editLottery)


app.delete("/api/delete-particularLottery/:lotteryId",validateGetLotteryById,customErrorHandler, authorize([string.Admin]),deleteLottery);


  app.post(
    "/api/create-purchase-lottery",
    validatePurchaseLotteryTicket,
    customErrorHandler,
    authenticateUser,
    createPurchase
  ); //fetch colorgame

  app.get(
    "/api/user-purchases/:userId",
    authenticateUser,
    validateGetUserPurchases,
    customErrorHandler,
    getUserPurchases
  ); //fetch colorgame not use in lottery admin

  app.get(
    "/api/allPurchase-Lotteries",
    authorize([string.Admin]),
    getAllPurchaseLotteries
  );





  
  
  
 










};
