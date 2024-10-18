import { Op } from "sequelize";
import { statusCode } from "../utils/statusCodes.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { TicketService } from "../constructor/ticketService.js";
import TicketRange from "../models/ticketRange.model.js";
import CustomError from "../utils/extendError.js";

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

        if (result) {
            const ticketService = new TicketService(
                group,
                series,
                number,
                sem
            );

            const tickets = ticketService.list();
            const price = ticketService.calculatePrice();
            return { tickets, price }
        }
        else {
            return { data: [], success: true, successCode: 200, message: "No tickets available in the given range." };
        }
    } catch (error) {
        console.error('Error saving ticket range:', error);
        return new CustomError(error.message, null, statusCode.internalServerError);
    }
};       
