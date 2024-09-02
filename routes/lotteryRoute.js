import {
  createLottery,
  getAllLotteries,
  getLotteryById,
  getTicketDetails,
  purchaseLotteryTicket,
} from "../controllers/lotteryController.js";
import {} from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const lotteryRoutes = (app) => {
  app.post("/api/create-lottery", createLottery);
  app.get("/api/getAllLotteries", getAllLotteries);
  app.get("/api/getParticularLotteries/:lotteryId", getLotteryById);
  app.get("/api/getTicketDetails/:id", getTicketDetails);
  app.post("/api/purchaseLottery",purchaseLotteryTicket);

};
