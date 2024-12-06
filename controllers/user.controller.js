import { Op, Sequelize } from "sequelize";
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
import PurchaseLottery from "../models/purchase.model.js";
import DrawDate from "../models/drawdateModel.js";
import LotteryResult from "../models/resultModel.js";
import { v4 as uuidv4 } from "uuid";

export const getAllMarkets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticketData = await TicketRange.findAll({
      attributes: ["marketId", "marketName", "isActive", "isWin", "isVoid"],
      where: {
        date: {
          [Op.gte]: today,
        },
        isVoid: false,
        isWin: false,
        hideMarketUser: true
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    return apiResponseSuccess(
      ticketData,
      true,
      statusCode.success,
      "Success",
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

export const searchTickets = async ({
  group,
  series,
  number,
  sem,
  marketId,
}) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      marketId,
      isVoid: false,
      group_start: { [Op.lte]: group },
      group_end: { [Op.gte]: group },
      series_start: { [Op.lte]: series },
      series_end: { [Op.gte]: series },
      number_start: { [Op.lte]: number },
      number_end: { [Op.gte]: number },
      createdAt: { [Op.gte]: today },
    };

    const result = await TicketRange.findOne({
      where: query,
    });

    const createRange = await UserRange.create({
      generateId: uuidv4(),
      group,
      series,
      number,
      sem,
    });

    if (result) {
      const ticketService = new TicketService();

      const tickets = await ticketService.list(
        group,
        series,
        number,
        sem,
        marketId
      );
      const price = await ticketService.calculatePrice(marketId, sem);

      return { tickets, price, sem, generateId: createRange.generateId };
    } else {
      return {
        tickets: [],
        success: true,
        successCode: 200,
        message: "No tickets available in the given range.",
      };
    }
  } catch (error) {
    return new CustomError(error.message, null, statusCode.internalServerError);
  }
};

export const PurchaseTickets = async (req, res) => {
  try {
    const { generateId, userId, userName, lotteryPrice } = req.body;
    const { marketId } = req.params;

    const userRange = await UserRange.findOne({
      where: { generateId: generateId },
    });

    if (!userRange) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Generated ID not found in UserRange",
        res
      );
    }

    const ticketRange = await TicketRange.findOne({
      where: {
        marketId: marketId,
        isVoid: false
      },
      attributes: ["marketId", "marketName", "price"],
    });

    if (!ticketRange) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market not found in TicketRange",
        res
      );
    }

    const { marketName, price } = ticketRange;
    const { group, series, number, sem } = userRange;

    await PurchaseLottery.create({
      generateId,
      userId,
      userName,
      marketId,
      marketName,
      group,
      series,
      number,
      sem,
      lotteryPrice,
      price,
    });

    return apiResponseSuccess(
      null,
      true,
      statusCode.create,
      "Lottery purchase successfully",
      res
    );
  } catch (error) {
    console.log("error", error.message);
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
    const { marketId } = req.params;
    const offset = (page - 1) * parseInt(limit);

    const purchaseFilter = {
      where: { userId, marketId },
      include: [
        {
          model: UserRange,
          as: "userRange",
          ...(sem && { where: { sem } }),
        },
      ],
      limit: parseInt(limit),
      offset,
    };

    const purchaseRecords = await PurchaseLottery.findAndCountAll(
      purchaseFilter
    );

    if (!purchaseRecords.rows.length) {
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
        const userRange = purchase.userRange;
        if (userRange) {
          const { group, series, number, sem: userSem } = userRange;
          const ticketService = new TicketService();

          return {
            tickets: await ticketService.list(
              group,
              series,
              number,
              userSem,
              marketId
            ),
            price: await ticketService.calculatePrice(marketId, userSem),
            userName: purchase.userName,
            sem: userRange.sem,
            marketId: purchase.marketId,
            marketName: purchase.marketName,
          };
        }
        return null;
      })
    );

    if (!historyWithTickets.length) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No purchase history found for the given sem",
        res
      );
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(purchaseRecords.count / limit),
      totalItems: purchaseRecords.count,
    };

    return apiResponsePagination(
      historyWithTickets,
      true,
      statusCode.success,
      "Success",
      pagination,
      res
    );
  } catch (error) {
    console.error("Error retrieving purchase history:", error);
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getDrawDateByDate = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const drawDates = await DrawDate.findAll({
      where: {
        createdAt: { [Op.gte]: today },
        isVoid: false,
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
    const announce = req.query.announce;

    const whereConditions = {
      prizeCategory: [
        "First Prize",
        "Second Prize",
        "Third Prize",
        "Fourth Prize",
        "Fifth Prize",
      ],
    };

    if (announce) {
      whereConditions.announceTime = announce;
    }

    const results = await LotteryResult.findAll({
      where: whereConditions,
      order: [["prizeCategory", "ASC"]],
      attributes: { include: ["createdAt"] },
    });

    const groupedResults = results.reduce((acc, result) => {
      const {
        prizeCategory,
        ticketNumber,
        prizeAmount,
        announceTime,
        createdAt,
      } = result;

      let formattedTicketNumbers = Array.isArray(ticketNumber)
        ? ticketNumber
        : [ticketNumber];

      if (prizeCategory === "Second Prize") {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) =>
          ticket.slice(-5)
        );
      } else if (
        prizeCategory === "Third Prize" ||
        prizeCategory === "Fourth Prize" ||
        prizeCategory === "Fifth Prize"
      ) {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) =>
          ticket.slice(-4)
        );
      }

      if (!acc[prizeCategory]) {
        acc[prizeCategory] = {
          prizeAmount: prizeAmount,
          ticketNumbers: formattedTicketNumbers,
          announceTime,
          date: createdAt,
        };
      } else {
        acc[prizeCategory].ticketNumbers.push(...formattedTicketNumbers);
      }

      return acc;
    }, {});

    const data = Object.entries(groupedResults).map(
      ([prizeCategory, { prizeAmount, ticketNumbers, announceTime, date }]) => {
        let limitedTicketNumbers;

        if (prizeCategory === "First Prize") {
          limitedTicketNumbers = ticketNumbers.slice(0, 1);
        } else if (
          ["Second Prize", "Third Prize", "Fourth Prize"].includes(
            prizeCategory
          )
        ) {
          limitedTicketNumbers = ticketNumbers.slice(0, 10);
        } else if (prizeCategory === "Fifth Prize") {
          limitedTicketNumbers = ticketNumbers.slice(0, 50);
        }

        while (
          limitedTicketNumbers.length < 10 &&
          prizeCategory !== "First Prize"
        ) {
          limitedTicketNumbers.push(
            limitedTicketNumbers[limitedTicketNumbers.length - 1]
          );
        }

        return {
          prizeCategory,
          prizeAmount,
          announceTime,
          date,
          ticketNumbers: [...new Set(limitedTicketNumbers)],
        };
      }
    );

    return apiResponseSuccess(
      data,
      true,
      statusCode.success,
      "Prize results retrieved successfully.",
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

export const dateWiseMarkets = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return apiResponseErr(null, false, statusCode.badRequest, "Date is required", res);
    }

    const selectedDate = new Date(date);
    if (isNaN(selectedDate)) {
      return apiResponseErr(null, false, statusCode.badRequest, "Invalid date format", res);
    }

    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const ticketData = await LotteryResult.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("marketName")), "marketName"],
        "marketId",
      ],
      where: {
        createdAt: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay,
        },
        isVoid: false
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    return apiResponseSuccess(ticketData, true, statusCode.success, "Success", res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};


export const getMarkets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const ticketData = await PurchaseLottery.findAll({
      where: { userId },
      attributes: ["marketId", "marketName"],
      where: {
        hidePurchase: false,
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const uniqueMarkets = Array.from(
      new Map(ticketData.map((item) => [item.marketId, item])).values()
    );

    return apiResponseSuccess(
      uniqueMarkets,
      true,
      statusCode.success,
      "Success",
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



