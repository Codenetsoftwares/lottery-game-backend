import { drawLottery } from "../controllers/resultController.js";
import Lottery from "../models/lotteryModel.js";
import {} from "../utills/commonSchema.js";
import customErrorHandler from "../utills/customErrorHandler.js";

export const resultRoutes = (app) => {
    app.post('/api/draw', drawLottery);
      
    
      
};
