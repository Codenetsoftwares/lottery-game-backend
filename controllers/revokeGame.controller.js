import PurchaseLottery from "../models/purchase.model.js";
import LotteryResult from "../models/resultModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
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
