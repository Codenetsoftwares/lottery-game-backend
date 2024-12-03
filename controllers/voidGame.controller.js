import PurchaseLottery from "../models/purchase.model.js";
import TicketRange from "../models/ticketRange.model.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import jwt from "jsonwebtoken";
import axios from "axios";

export const voidMarket = async (req, res) => {
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
    const market = await TicketRange.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market Not Found",
        res
      );
    }

    market.isVoid = true;
    await market.save();

    const usersByMarket = await PurchaseLottery.findAll({
      where: { marketId },
      attributes: ["marketId", "userId", "userName", "hidePurchase"],
    });

    const userIds = usersByMarket.map((user) => user.userId);

    const baseURL = process.env.COLOR_GAME_URL;

    const response = await axios.post(
      `${baseURL}/api/external/void-market-lottery`,
      {
        marketId,
        userId: userIds,
      },
      { headers }
    );
    let { data } = response.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return res
          .status(statusCode.internalServerError)
          .send(
            apiResponseErr(
              null,
              false,
              statusCode.internalServerError,
              "Failed to parse response data"
            )
          );
      }
    }

    await PurchaseLottery.update(
      { hidePurchase: true },
      { where: { marketId } }
    );

    return apiResponseSuccess(
      usersByMarket,
      true,
      statusCode.success,
      " Balances updated successfully and market voided",
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
