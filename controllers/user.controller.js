import { Op } from "sequelize";
import { statusCode } from "../utils/statusCodes.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { TicketService } from "../constructor/ticketService.js";
import TicketRange from "../models/ticketRange.model.js";
import CustomError from "../utils/extendError.js";
import UserRange from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import PurchaseLottery from "../models/purchase.model.js";
import DrawDate from "../models/drawdateModel.js";
import LotteryResult from "../models/resultModel.js";

export const searchTickets = async ({ group, series, number, sem }) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await TicketRange.findOne({
      where: {
        group_start: { [Op.lte]: group }, // group_start <= user group
        group_end: { [Op.gte]: group }, // group_end >= user group
        series_start: { [Op.lte]: series }, // series_start <= user series
        series_end: { [Op.gte]: series }, // series_end >= user series
        number_start: { [Op.lte]: number }, // number_start <= user number
        number_end: { [Op.gte]: number }, // number_end >= user number
        createdAt: { [Op.gte]: today },
      },
    });

    const createRange = await UserRange.create({
      generateId: uuidv4(),
      group,
      series,
      number,
      sem,
    });

    if (result) {
      const ticketService = new TicketService(
        group,
        series,
        number.toString(),
        sem
      );

      const tickets = ticketService.list();
      const price = ticketService.calculatePrice();
      return { tickets, price, sem, generateId: createRange.generateId };
    } else {
      return {
        data: [],
        success: true,
        successCode: 200,
        message: "No tickets available in the given range.",
      };
    }
  } catch (error) {
    console.error("Error saving ticket range:", error);
    return new CustomError(error.message, null, statusCode.internalServerError);
  }
};

export const PurchaseTickets = async (req, res) => {
  try {
    const { generateId, drawDate, userId, userName } = req.body;
    await UserRange.findOne({
      where: {
        generateId: generateId,
      },
    });
    await PurchaseLottery.create({ generateId, drawDate, userId, userName });
    return apiResponseSuccess(
      null,
      true,
      statusCode.create,
      "Lottery purchase successfully",
      res
    );
  } catch (error) {
    console.error("Error saving ticket range:", error);

    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const purchaseHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const { sem, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const purchaseFilter = {
      where: { userId },
      include: [{
        model: UserRange,
        as: 'userRange',
        ...(sem && { where: { sem } })
      }],
      limit: parseInt(limit),
      offset,
    };

    const purchaseRecords = await PurchaseLottery.findAndCountAll(purchaseFilter);

    if (!purchaseRecords.rows.length) {
      return apiResponseSuccess([], true, statusCode.success, "No purchase history found", res);
    }

    const historyWithTickets = (await Promise.all(
      purchaseRecords.rows.map(async (purchase) => {
        const userRange = purchase.userRange;
        if (userRange) {
          const { group, series, number, sem: userSem } = userRange;
          const ticketService = new TicketService(group, series, number, userSem);

          return {
            drawDate: purchase.drawDate,
            tickets: ticketService.list(),
            price: ticketService.calculatePrice(),
            userName: purchase.userName,
            sem: userRange.sem,
          };
        }
        return null;
      })
    ))

    if (!historyWithTickets.length) {
      return apiResponseSuccess([], true, statusCode.success, "No purchase history found for the given sem", res);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(purchaseRecords.count / limit),
      totalItems: purchaseRecords.count,
    };

    return apiResponsePagination(historyWithTickets, true, statusCode.success, "Success", pagination, res);
  } catch (error) {
    console.error("Error retrieving purchase history:", error);
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};


export const getDrawDateByDate = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const drawDates = await DrawDate.findAll({
      where: {
        createdAt: { [Op.gte]: today },
      },
      attributes: ["drawId", "drawDate"],
    });

    return apiResponseSuccess(
      drawDates,
      true,
      statusCode.success,
      "Draw dates retrieved successfully.",
      res
    );
  } catch (error) {
    apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    );
  }
};



export const getResult = async (req, res) => {
  try {
    const results = await LotteryResult.findAll({
      where: {
        prizeCategory: ['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'],
      },
      order: [['prizeCategory', 'ASC']], 
    });

    
    const groupedResults = results.reduce((acc, result) => {
      const { prizeCategory, ticketNumber, prizeAmount } = result;

      
      let formattedTicketNumber = ticketNumber; 
      if (prizeCategory === 'Second Prize') {
        
        formattedTicketNumber = ticketNumber.slice(-5);
      } else if (prizeCategory === 'Third Prize' || prizeCategory === 'Fourth Prize' || prizeCategory === 'Fifth Prize') {
        formattedTicketNumber = ticketNumber.slice(-4);
      }

      if (!acc[prizeCategory]) {
        acc[prizeCategory] = {
          prizeAmount: prizeAmount, 
          ticketNumbers: [formattedTicketNumber], 
        };
      } else {
        acc[prizeCategory].ticketNumbers.push(formattedTicketNumber);
      }
      return acc;
    }, {});

    const formattedResults = Object.entries(groupedResults).map(([prizeCategory, { prizeAmount, ticketNumbers }]) => ({
      prizeCategory,
      prizeAmount,
      ticketNumbers,
    }));

    return apiResponseSuccess(
      formattedResults,
      true,
      statusCode.success,
      'Prize results retrieved successfully.',
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};