import { TicketService } from "../constructor/ticketService.js";
import PurchaseLottery from "../models/purchase.model.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const getLotteryBetHistory = async (req, res) => {
    try {
        const { userId } = req.body
        const purchaseLotteries = await PurchaseLottery.findAll({ where: { userId } });

        if (purchaseLotteries.length === 0) {
            return apiResponseSuccess([], true, statusCode.success, "No bet history found", res);
        }

        const betHistory = purchaseLotteries.map(purchase => {
            const { group, series, number, sem } = purchase;
            const ticketService = new TicketService(group, series, number, sem);

            const tickets = ticketService.list();

            return {
                gameName: "Lottery",
                marketName: purchase.marketName,
                marketId: purchase.marketId,
                amount: purchase.lotteryPrice,
                ticketPrice: purchase.price,
                tickets,
                sem
            };
        });
        return apiResponseSuccess(betHistory, true, statusCode.success, 'success', res);
    } catch (error) {
        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
    }
};
