import { Op } from 'sequelize';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import TicketRange from '../models/ticketRange.model.js';
import { v4 as uuidv4 } from 'uuid';

export const saveTicketRange = async (req, res) => {
  try {
    const {
      group,
      series,
      number,
      start_time,
      end_time,
      marketName,
      date,
      price,
    } = req.body;

    const currentDate = new Date();
    const providedDate = new Date(date);

    if (providedDate < currentDate.setHours(0, 0, 0, 0)) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'The date must be today or in the future.',
        res
      );
    }

    const existingMarket = await TicketRange.findOne({
      where: {
        marketName,
        date: providedDate,
      },
    });

    if (existingMarket) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'A market with this name already exists for the selected date.',
        res
      );
    }

    const ticket = await TicketRange.create({
      marketId: uuidv4(),
      group_start: group.min,
      group_end: group.max,
      series_start: series.start,
      series_end: series.end,
      number_start: number.min,
      number_end: number.max,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      marketName,
      date: providedDate,
      price,
    });

    return apiResponseSuccess(ticket, true, statusCode.create, 'Ticket range generated successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};



export const geTicketRange = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticketData = await TicketRange.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
        isVoid: false,
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, 'No data', res);
    }

    return apiResponseSuccess(ticketData, true, statusCode.success, 'Success', res);
  } catch (error) {
    console.error('Error saving ticket range:', error);

    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};
