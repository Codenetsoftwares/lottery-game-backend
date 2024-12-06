import PurchaseLottery from "../models/purchase.model.js";
import LotteryResult from "../models/resultModel.js";
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import axios from "axios";

export const revokeMarket = async (req, res) => {
  try {

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { marketId } = req.body;
    const market = await LotteryResult.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market Not Found",
        res
      );
    }
    market.isRevoke = true;
    await market.save();

    const usersByMarket = await PurchaseLottery.findAll({
        where: { marketId },
        attributes: ["marketId", "userId", "userName"],
      });

      const baseURL = process.env.COLOR_GAME_URL;
      const response = await axios.post(
        `${baseURL}/api/external/revoke-market-lottery`,
        {
          marketId,
        },
        { headers }
      );
     
      return apiResponseSuccess(
        usersByMarket,
        true,
        statusCode.success,
        " Balances updated successfully and market revoked",
        res
      );  
  } catch (error) {
    if (error.response) {
        console.log("Error Response:", error.response.data);
        return apiResponseErr(
          null,
          false,
          error.response.status || statusCode.internalServerError,
          error.response.data.errMessage || "An error occurred while revoking the market",
          res
        );
      } 
        else {
        console.log("Unexpected Error:", error.message);
        return apiResponseErr(
          null,
          false,
          statusCode.internalServerError,
          error.message,
          res
        );
      }
    }
};

export const getRevokeMarkets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereCondition = { isRevoke: true };
    if (search) {
      whereCondition.marketName = { [Op.like]: `%${search}%` };
    }

    const { rows: voidMarkets, count: totalItems } =
      await LotteryResult.findAndCountAll({
        where: whereCondition,
        limit: parsedLimit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

    if (voidMarkets.length === 0) {
      const message = search
        ? `No revoke markets found with the name '${search}'.`
        : "No revoke markets found.";
      return apiResponseErr([], true, statusCode.badRequest, message, res);
    }

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return apiResponsePagination(
      voidMarkets,
      true,
      statusCode.success,
      "revoke markets retrieved successfully",
      {
        page: parsedPage,
        limit: parsedLimit,
        totalPages: totalPages,
        totalItems: totalItems,
      },
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
