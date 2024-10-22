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
                number.toString(),
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
        const { generateId, drawDate, userId, userName } = req.body
        await UserRange.findOne({
            where: {
                generateId: generateId
            },
        });
        await PurchaseLottery.create({ generateId, drawDate, userId, userName })
        return apiResponseSuccess(null, true, statusCode.create, 'Lottery purchase successfully', res);

    } catch (error) {
        console.error('Error saving ticket range:', error);

        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res)
    }
};


export const purchaseHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const totalItems = await PurchaseLottery.count({
            where: {
                userId: userId
            }
        });
        const purchaseRecords = await PurchaseLottery.findAll({
            where: {
                userId: userId
            },
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        if (!purchaseRecords || purchaseRecords.length === 0) {
            return apiResponsePagination(null, true, statusCode.success, 'No purchase history found', {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems
            }, res);
        }

        const historyWithTickets = await Promise.all(
            purchaseRecords.map(async (purchase) => {
                const userRange = await UserRange.findOne({
                    where: {
                        generateId: purchase.generateId
                    }
                });

                if (userRange) {
                    const { group, series, number, sem } = userRange;

                    const ticketService = new TicketService(group, series, number.toString(), sem);
                    const tickets = ticketService.list();

                    return {
                        drawDate: purchase.drawDate,
                        tickets: tickets,
                        price: ticketService.calculatePrice()
                    }


                } else {
                    return apiResponseSuccess([], true, statusCode.success, 'No purchase history found', res);
                }
            })
        );
        const totalPages = Math.ceil(totalItems / limit);

        return apiResponsePagination(historyWithTickets, true, statusCode.success, 'Success', {
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: totalPages,
            totalItems: totalItems
        }, res);

    } catch (error) {
        console.error('Error saving ticket range:', error);

        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res)
    }
};

