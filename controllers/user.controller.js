import { Op } from "sequelize";
import { statusCode } from "../utils/statusCodes.js";
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from "../utils/response.js";
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
        const { sem, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
      
        const purchaseRecords = await PurchaseLottery.findAndCountAll({
            where: {
                userId: userId
            },
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        if (!purchaseRecords.rows || purchaseRecords.rows.length === 0) {
            return apiResponseSuccess(
              [],
              true,
              statusCode.success,
              "No purchase history found",
              res
            );
          }

          const historyWithTickets = await Promise.all(
            purchaseRecords.rows.map(async (purchase) => {
              const userRangeQuery = {
                where: {
                  generateId: purchase.generateId,
                },
              };
              if (sem) {
                userRangeQuery.where.sem = sem;
              }
      
              const userRange = await UserRange.findOne(userRangeQuery);
      
              if (userRange) {
                const { group, series, number, sem: userSem } = userRange;
      
                const ticketService = new TicketService(
                  group,
                  series,
                  number,
                  userSem
                );
                const tickets = ticketService.list();
      
                return {
                  drawDate: purchase.drawDate,
                  tickets: tickets,
                  price: ticketService.calculatePrice(),
                  userName: purchase.userName,
                };
              } else {
                return null;
              }
            })
          )
          const filteredHistoryWithTickets = historyWithTickets.filter(
            (record) => record !== null
          );
          if (filteredHistoryWithTickets.length === 0) {
            return apiResponseSuccess(
              [],
              true,
              statusCode.success,
              "No purchase history found for the given sem",
              res
            );
          }
           // Apply pagination to the filteredHistoryWithTickets
    const paginatedHistoryWithTickets = filteredHistoryWithTickets.slice(
        offset,
        offset + parseInt(limit)
      );
  
      const totalItems = filteredHistoryWithTickets.length;
      const totalPages = Math.ceil(totalItems / limit);
       

        return apiResponsePagination(paginatedHistoryWithTickets, true, statusCode.success, 'Success', {
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
            totalItems
        }, res);

    } catch (error) {
        console.error('Error saving ticket range:', error);

        return apiResponseErr(null, false, statusCode.internalServerError, error.message, res)
    }
};

