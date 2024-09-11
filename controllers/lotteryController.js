import moment from "moment";
import Lottery from "../models/lotteryModel.js";
import Ticket from "../models/ticketModel.js";
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";
import LotteryPurchase from "../models/lotteryPurchaseModel.js";

// Create Lottery API
export const createLottery = async (req, res) => {
  try {
    const {
      name,
      date,
      firstPrize,
      sem,
      price
    } = req.body;

    const ticket = await Ticket.findOne({
      order: [['createdAt', 'DESC']],
    });
    if (!ticket) {
      return apiResponseSuccess(
        null,
        false,
        statusCode.success,
        "Ticket not available",
        res
      );
    }

    const lottery = await Lottery.create({
      name,
      date: moment(date).utc().format(),
      firstPrize,
      ticketNumber: ticket.ticketNumber,
      sem,
      price
    })

    await ticket.destroy({
      ticketNumber: lottery.ticketNumber
    });

    return apiResponseSuccess(
      lottery,
      true,
      statusCode.create,
      "Lottery created successfully",
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

//get all lottery Api
export const getAllLotteries = async (req, res) => {
  try {
    const { sem, page = 1, pageSize = 10 } = req.query;

    const whereConditions = { isPurchased: false };

    if (sem) {
      whereConditions.sem = sem;
    }

    const offset = (page - 1) * pageSize;

    const lotteries = await Lottery.findAndCountAll({
      where: whereConditions,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      totalPages: Math.ceil(lotteries.count / pageSize),
      totalItems: lotteries.count,
    };

    return apiResponsePagination(
      lotteries.rows,
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



// Get a specific lottery by ID
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
        statusCode.notFound,
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


export const createPurchase = async (req, res) => {
  try {
    const { userId, lotteryId ,userName} = req.body;

    const lottery = await Lottery.findOne({
      where: { lotteryId },
    });
    if (!lottery) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Lottery not found",
        res
      );
    }

    if(lottery.isPurchased === true)
    {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Lottery not available",
        res
      );
    }

    const purchase = await LotteryPurchase.create({
      userId,
      lotteryId,
      userName,
      ticketNumber: lottery.ticketNumber,
      purchaseAmount: lottery.sem * lottery.price,
      sem:lottery.sem,
      name:lottery.name
    });

     await lottery.update({ isPurchased: true })

    return apiResponseSuccess(
      purchase,
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
    const purchases = await LotteryPurchase.findAll({
      where: { userId },
    });

    if (!purchases || purchases.length === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "No purchases found",
        res
      );
    }
    return apiResponseSuccess(
      purchases,
      true,
      statusCode.success,
      "Lottery ticket purchase retractive successfully",
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
    const { page = 1, limit = 10, } = req.query;
    let whereCondition = {};
    const offset = (page - 1) * limit;
    const { rows: purchases, count } = await LotteryPurchase.findAndCountAll({
      where: whereCondition,
      offset,
      limit: parseInt(limit),
    });

    if (!purchases || purchases.length === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
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




