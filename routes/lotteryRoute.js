import { string } from "../constructor/string.js";
import {
  createLottery,
  getAllLotteries,
  getLotteryById,
  getTicketDetails,
  purchaseLotteryTicket,
} from "../controllers/lotteryController.js";
import { authorize } from "../middlewares/auth.js";
import {} from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const lotteryRoutes = (app) => {
  app.post("/api/create-lottery",authorize([string.Admin]), createLottery);
  app.get("/api/getAllLotteries", getAllLotteries);
  app.get("/api/getParticularLotteries/:lotteryId", getLotteryById);
  app.get("/api/getTicketDetails/:id", getTicketDetails);
  app.post("/api/purchaseLottery",purchaseLotteryTicket);

};
