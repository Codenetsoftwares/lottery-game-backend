import { Op } from "sequelize";
import { TicketService } from "../constructor/ticketService.js";
import PurchaseLottery from "../models/purchase.model.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const getLotteryBetHistory = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    const { dataType } = req.query;

    let startDate, endDate;

    if (dataType === "live") {
      const today = new Date();
      startDate = new Date(today).setHours(0, 0, 0, 0);
      endDate = new Date(today).setHours(23, 59, 59, 999);
    } else if (dataType === "olddata") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
      } else {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        startDate = new Date(oneYearAgo).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      }
    } else if (dataType === "backup") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
        const maxAllowedDate = new Date(startDate);
        maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 3);
        if (endDate > maxAllowedDate) {
          return apiResponseErr(
            [],
            false,
            statusCode.badRequest,
            "The date range for backup data should not exceed 3 months.",
            res
          );
        }
      } else {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 2);
        startDate = new Date(threeMonthsAgo.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }
    } else {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Data not found.",
        res
      );
    }

    const queryConditions = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };
    if (userId) queryConditions.userId = userId;
    if (userName) queryConditions.userName = userName;

    const { rows: purchaseLotteries, count: totalRecords } =
      await PurchaseLottery.findAndCountAll({
        where: queryConditions,
        limit: pageSize,
        offset,
      });

    if (purchaseLotteries.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No bet history found",
        res
      );
    }
    const totalPages = Math.ceil(totalRecords / pageSize);
    const betHistory = await Promise.all(
      purchaseLotteries.map(async (purchase) => {
        const { group, series, number, sem, marketId } = purchase;
        const ticketService = new TicketService();

        const tickets = await ticketService.list(
          group,
          series,
          number,
          sem,
          marketId
        );

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

    const response = {
      page,
      limit: pageSize,
      totalPages,
      totalItems: totalRecords,
    };

    return apiResponsePagination(
      betHistory,
      true,
      statusCode.success,
      "success",
      response,
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

export const lotteryMarketAnalysis = async (req, res) => {
  try {
    const { marketId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const purchaseLotteries = await PurchaseLottery.findAll({
      where: {
        marketId,
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    if (purchaseLotteries.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No bet history found",
        res
      );
    }

    const totalAmount = purchaseLotteries.reduce(
      (sum, purchase) => sum + purchase.lotteryPrice,
      0
    );

    const commonData = {
      gameName: "Lottery",
      marketName: purchaseLotteries[0].marketName,
      marketId: purchaseLotteries[0].marketId,
      amount: totalAmount,
    };

    const ticketsData = await Promise.all(
      purchaseLotteries.map(async (purchase) => {
        const { group, series, number, sem, marketId } = purchase;
        const ticketService = new TicketService();
        const tickets = await ticketService.list(
          group,
          series,
          number,
          sem,
          marketId
        );

        return { tickets, sem };
      })
    );

    const response = {
      ...commonData,
      details: ticketsData,
    };

    return apiResponseSuccess(
      response,
      true,
      statusCode.success,
      "success",
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
