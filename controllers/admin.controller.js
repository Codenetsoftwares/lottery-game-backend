import Admin from "../models/adminModel.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import { statusCode } from "../utils/statusCodes.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TicketService } from "../constructor/ticketService.js";
import CustomError from "../utils/extendError.js";
import TicketRange from "../models/ticketRange.model.js";
import { Op } from "sequelize";
import UserRange from "../models/user.model.js";
import PurchaseLottery from "../models/purchase.model.js";
import DrawDate from "../models/drawdateModel.js";
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await Admin.findOne({
      where: { userName: userName },
    });

    if (existingAdmin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin already exist",
        res
      );
    }

    const newAdmin = await Admin.create({
      adminId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(
      newAdmin,
      true,
      statusCode.create,
      "created successfully",
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

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "User does not exist",
        res
      );
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid username or password",
        res
      );
    }

    const userResponse = {
      adminId: existingUser.adminId, // assuming 'id' is the primary key
      userName: existingUser.userName,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return apiResponseSuccess(
      {
        accessToken,
        ...userResponse,
      },
      true,
      statusCode.success,
      "login successfully",
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

export const adminSearchTickets = async ({ group, series, number, sem }) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await TicketRange.findOne({
      where: {
        group_start: { [Op.lte]: group },
        group_end: { [Op.gte]: group },
        series_start: { [Op.lte]: series },
        series_end: { [Op.gte]: series },
        number_start: { [Op.lte]: number },
        number_end: { [Op.gte]: number },
        createdAt: { [Op.gte]: today },
      },
    });

    if (result) {
      const ticketService = new TicketService(group, series, number, sem);

      const tickets = ticketService.list();
      const price = ticketService.calculatePrice();
      return { tickets, price, sem };
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

export const adminPurchaseHistory = async (req, res) => {
  try {
    const { sem, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const purchaseRecords = await PurchaseLottery.findAndCountAll({
      offset,
      limit: parseInt(limit),
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
            sem: userRange.sem,
          };
        } else {
          return null;
        }
      })
    );

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

    return apiResponsePagination(
      paginatedHistoryWithTickets,
      true,
      statusCode.success,
      "Success",
      {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems,
      },
      res
    );
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const createDrawDate = async (req, res) => {
  try {
    const { drawDate } = req.body;

    const existingDate = await DrawDate.findOne({
      where: { drawDate },
    });
    if (existingDate) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Draw date already exists.",
        res
      );
    }

    const newDrawDate = await DrawDate.create({ drawId: uuidv4(), drawDate });

    return apiResponseSuccess(
      newDrawDate,
      true,
      statusCode.create,
      "Draw date created successfully.",
      res
    );
  } catch (error) {
    console.error("Error creating draw date:", error);
    apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};
