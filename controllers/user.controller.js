import { Op } from "sequelize";
import { statusCode } from "../utils/statusCodes.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { TicketService } from "../constructor/ticketService.js";
import TicketRange from "../models/ticketRange.model.js";
import CustomError from "../utils/extendError.js";
import UserRange from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import PurchaseLottery from "../models/purchase.model.js";

export const searchTickets = async ({ group, series, number, sem }) => {
    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await TicketRange.findOne({
            where: {
                group_start: { [Op.lte]: group }, // group_start <= user group
                group_end: { [Op.gte]: group },   // group_end >= user group
                series_start: { [Op.lte]: series }, // series_start <= user series
                series_end: { [Op.gte]: series },   // series_end >= user series
                number_start: { [Op.lte]: number },  // number_start <= user number
                number_end: { [Op.gte]: number },    // number_end >= user number
                createdAt: { [Op.gte]: today }
            },
        });

        const createRange = await UserRange.create({ generateId: uuidv4(), group, series, number, sem })

        if (result) {
            const ticketService = new TicketService(
                group,
                series,
                number,
                sem
            );

            const tickets = ticketService.list();
            const price = ticketService.calculatePrice();
            return { tickets, price, sem, generateId: createRange.generateId }
        }
        else {
            return { data: [], success: true, successCode: 200, message: "No tickets available in the given range." };
        }
    } catch (error) {
        console.error('Error saving ticket range:', error);
        return new CustomError(error.message, null, statusCode.internalServerError);
    }
};

export const PurchaseTickets = async (req, res) => {
    try {
        const { generateId, drawDate, userId } = req.body
        await UserRange.findOne({
            where: {
                generateId: generateId
            },
        });
        await PurchaseLottery.create({ generateId, drawDate ,userId})
        return apiResponseSuccess(null, true, statusCode.create, 'Lottery purchase successfully', res);

    } catch (error) {
        console.error('Error saving ticket range:', error);

        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res)
    }
};  