import { Op } from "sequelize";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import TicketRange from "../models/ticketRange.model.js";

export const saveTicketRange = async (req, res) => {
    try {
        const { group, series, number } = req.body

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ticketData = await TicketRange.findOne({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            }
        });

        if (ticketData) {
            return apiResponseErr(null, false, statusCode.badRequest, 'Ticket for today has already been created.', res);
        }

        const ticket = await TicketRange.create({
            group_start: group.min,
            group_end: group.max,
            series_start: series.start,
            series_end: series.end,
            number_start: number.min,
            number_end: number.max,
        });
        return apiResponseSuccess(ticket, true, statusCode.create, 'Generate ticket successfully', res);
    } catch (error) {
        console.error('Error saving ticket range:', error);

        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res)
    }
};       
