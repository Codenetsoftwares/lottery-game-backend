import moment from "moment";
import Lottery from "../models/lotteryModel.js";
import Ticket from "../models/ticketModel.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";
import LotteryPurchase from "../models/lotteryPurchaseModel.js";
import { Op } from "sequelize";

export const createLottery = async (req, res) => {
  try {
    const { name, date, firstPrize, sem, price } = req.body;

    if (!name || !date || !firstPrize || !sem || !price) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "All fields are required",
        res
      );
    }
    const ticket = await Ticket.findOne({
      where: { sem },
      order: [["createdAt", "DESC"]],
    });

    if (!ticket) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No available tickets with the specified sem",
        res
      );
    }

    const lottery = await Lottery.create({
      name,
      date: moment(date).utc().format(),
      firstPrize,
      ticketNumber: ticket.ticketNumber,
      sem,
      price,
    });

    await ticket.destroy();

    return apiResponseSuccess(
      lottery,
      true,
      statusCode.create,
      `${sem} sem lottery created successfully`,
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getAllLotteries = async (req, res) => {
  try {
    const { sem, page = 1, pageSize = 10 } = req.query;

    const whereConditions = { isPurchased: false };

    if (sem) {
      whereConditions.sem = sem;
    }

    const offset = (page - 1) * pageSize;

    const lotteries = await Lottery.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: whereConditions,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
    });

    if (lotteries.count === 0) {
      return apiResponseSuccess(
        null,
        true,
        statusCode.success,
        "No lotteries found",
        res
      );
    }

    // Since ticketNumber is stored as a JSON array, no need to parse
    const parsedLotteries = lotteries.rows.map((lottery) => ({
      ...lottery.dataValues,
      ticketNumber: lottery.ticketNumber, // This will be an array if stored correctly
    }));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      totalPages: Math.ceil(lotteries.count / pageSize),
      totalItems: lotteries.count,
    };

    return apiResponsePagination(
      parsedLotteries,
      true,
      statusCode.success,
      "Lotteries retrieved successfully",
      pagination,
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};


export const deleteNonPurchasedLotteries = async (req, res) => {
  try {
    const result = await Lottery.destroy({
      where: {
        isPurchased: false,
      },
    });

    if (result > 0) {
      return apiResponseSuccess(
        result,
        true,
        statusCode.success,
        `${result} non-purchased lotteries deleted successfully.`,
        res
      );
    } else {
      return apiResponseSuccess(
        null,
        true,
        statusCode.success,
        "No non-purchased lotteries found.",
        res
      );
    }
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getLotteryById = async (req, res) => {
  try {
    const { lotteryId } = req.params;
    const lottery = await Lottery.findOne({
      where: { lotteryId },
    });
    if (!lottery) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Lottery not found",
        res
      );
    }

    const lotteryAmount = lottery.price * lottery.sem;

    return apiResponseSuccess(
      lotteryAmount,
      true,
      statusCode.success,
      "Lottery retrieved successfully",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};


export const editLottery = async (req, res) => {
  const { lotteryId } = req.params;
  const { name, date, firstPrize, price } = req.body;

  try {
    const lottery = await Lottery.findOne({ where: { lotteryId } });

    if (!lottery) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Lottery not found",
        res
      );
    }

    await lottery.update({
      name,
      date,
      firstPrize,
      price,
    });

    return apiResponseSuccess(
      lottery,
      true,
      statusCode.success,
      "Lottery updated successfully",
      res
    );

  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const deleteLottery = async (req, res) => {
  const { lotteryId } = req.params;

  try {
    const lottery = await Lottery.findOne({ where: { lotteryId } });

    if (!lottery) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Lottery not found",
        res
      );
    }

    await lottery.destroy();
    return apiResponseSuccess(
      null,
      true,
      statusCode.success,
      "Lottery deleted successfully",
      res
    );

  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { userId, lotteryId, userName } = req.body;

    const lottery = await Lottery.findOne({
      where: { lotteryId },
    });

    if (!lottery) {
      return apiResponseErr(
        null,
        true,
        statusCode.badRequest,
        "Lottery not found",
        res
      );
    }

    if (lottery.isPurchased === true) {
      return apiResponseSuccess(
        null,
        true,
        statusCode.success,
        "Lottery not available",
        res
      );
    }

    const ticketNumberArray = Array.isArray(lottery.ticketNumber)
      ? lottery.ticketNumber 
      : lottery.ticketNumber.split(','); 

    const purchase = await LotteryPurchase.create({
      userId,
      lotteryId,
      userName,
      ticketNumber: ticketNumberArray, 
      purchaseAmount: lottery.sem * lottery.price,
      sem: lottery.sem,
      name: lottery.name,
      drawTime: lottery.date,
    });

    lottery.isPurchased = true;
    const result = await lottery.save();

    return apiResponseSuccess(
      result,
      true,
      statusCode.create,
      "Lottery ticket purchased successfully",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};


export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows: purchases, count: totalItems } =
      await LotteryPurchase.findAndCountAll({
        order: [["createdAt", "DESC"]],
        where: { userId },
        limit,
        offset,
      });

    if (!purchases || purchases.length === 0) {
      return apiResponseSuccess(
        null,
        true,
        statusCode.success,
        "No purchases found",
        res
      );
    }

    const totalPages = Math.ceil(totalItems / limit);
    return apiResponsePagination(
      purchases,
      true,
      statusCode.success,
      "Lottery ticket purchase retrieved successfully",
      {
        page,
        limit,
        totalItems,
        totalPages,
      },
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};
export const getAllPurchaseLotteries = async (req, res) => {
  try {
    const { page = 1, limit = 10, purchaseDate, sem, drawTime } = req.query;
    let whereCondition = {};

    if (purchaseDate) {
      whereCondition.purchaseDate = {
        [Op.eq]: new Date(purchaseDate),
      };
    }

    if (sem) {
      whereCondition.sem = sem;
    }

    if (drawTime) {
      whereCondition.drawTime = {
        [Op.eq]: drawTime,
      };
    }

    const offset = (page - 1) * limit;
    const { rows: purchases, count } = await LotteryPurchase.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: whereCondition,
      offset,
      limit: parseInt(limit),
    });

    if (!purchases || purchases.length === 0) {
      return apiResponseSuccess(
        null,
        true,
        statusCode.success,
        "No purchases found",
        res
      );
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    };

    return apiResponsePagination(
      purchases,
      true,
      statusCode.success,
      "Purchase lotteries retrieved successfully",
      pagination,
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};
