import { TicketService } from "../constructor/ticketService.js";
import PurchaseLottery from "../models/purchase.model.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const getLotteryBetHistory = async (req, res) => {
    try {
        const { userId, userName } = req.body;

        console.log("userId, userName ", userId, userName)

        const queryConditions = {};
        if (userId) queryConditions.userId = userId;
        if (userName) queryConditions.userName = userName;

        const purchaseLotteries = await PurchaseLottery.findAll({ where: queryConditions });


        if (purchaseLotteries.length === 0) {
            return apiResponseSuccess([], true, statusCode.success, "No bet history found", res);
        }

        const betHistory = await Promise.all(
            purchaseLotteries.map(async (purchase) => {
                const { group, series, number, sem, marketId } = purchase;
                const ticketService = new TicketService();

                const tickets = await ticketService.list(group, series, number, sem, marketId);

                return {
                    gameName: "Lottery",
                    marketName: purchase.marketName,
                    marketId: purchase.marketId,
                    amount: purchase.lotteryPrice,
                    ticketPrice: purchase.price,
                    tickets,
                    sem,
                };
            })
        );

        return apiResponseSuccess(betHistory, true, statusCode.success, 'success', res);
    } catch (error) {
        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
    }
};
