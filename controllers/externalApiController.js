import Lottery from "../models/lotteryModel.js";
import { apiResponseErr, apiResponsePagination } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";

export const getAllExternalLotteries = async (req, res) => {
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
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};
