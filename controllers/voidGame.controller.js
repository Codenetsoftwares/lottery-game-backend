import PurchaseLottery from "../models/purchase.model.js";
import TicketRange from "../models/ticketRange.model.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const voidMarket = async(req, res)=>{
    try {
        const {marketId} = req.body;
        const market = await TicketRange.findOne({where :{marketId} })
        if(!market){
        return apiResponseErr(null, false, statusCode.badRequest, 'Market Not Found', res);
        }

        market.isVoid = true;
        await market.save();  
        
        const usersByMarket = await PurchaseLottery.findAll({
            where: { marketId }, 
            attributes: ['marketId', 'userId', 'userName'], 
          });

         return apiResponseSuccess(usersByMarket, true , statusCode.success, " Successfully", res)
    } catch (error) {
        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
    }
}