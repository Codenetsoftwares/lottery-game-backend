import Admin from '../models/adminModel.js';
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
import { statusCode } from '../utils/statusCodes.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TicketService } from '../constructor/ticketService.js';
import CustomError from '../utils/extendError.js';
import TicketRange from '../models/ticketRange.model.js';
import { Op } from 'sequelize';
import UserRange from '../models/user.model.js';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await Admin.findOne({
      where: { userName: userName },
    });

    if (existingAdmin) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Admin already exist', res);
    }

    const newAdmin = await Admin.create({
      adminId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(newAdmin, true, statusCode.create, 'created successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(null, false, statusCode.badRequest, 'User does not exist', res);
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Invalid username or password', res);
    }

    const userResponse = {
      adminId: existingUser.adminId, // assuming 'id' is the primary key
      userName: existingUser.userName,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return apiResponseSuccess(
      {
        accessToken,
        ...userResponse,
      },
      true,
      statusCode.success,
      'login successfully',
      res,
    );
  } catch (error) {
    apiResponseErr(null, false, statusCode.internalServerError, error.errMessage ?? error.message, res);
  }
};

export const adminSearchTickets = async ({ group, series, number, sem, marketId }) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      group_start: { [Op.lte]: group },
      group_end: { [Op.gte]: group },
      series_start: { [Op.lte]: series },
      series_end: { [Op.gte]: series },
      number_start: { [Op.lte]: number },
      number_end: { [Op.gte]: number },
      createdAt: { [Op.gte]: today },
      ...(marketId && { marketId }), // Add marketId condition if it is provided
    };

    const result = await TicketRange.findOne({
      where: query,
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
        message: 'No tickets available in the given range or market.',
      };
    }
  } catch (error) {
    return new CustomError(error.message, null, statusCode.internalServerError);
  }
};


export const adminPurchaseHistory = async (req, res) => {
  try {
    const { sem, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const purchaseRecords = await PurchaseLottery.findAndCountAll({
      include: [
        {
          model: UserRange,
          as: 'userRange',
          ...(sem && { where: { sem } }),
        },
      ],
      limit: parseInt(limit),
      offset,
    });

    if (!purchaseRecords.rows || purchaseRecords.rows.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, 'No purchase history found', res);
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

          const ticketService = new TicketService(group, series, number, userSem);
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
      }),
    );

    const filteredHistoryWithTickets = historyWithTickets.filter((record) => record !== null);

    if (filteredHistoryWithTickets.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, 'No purchase history found for the given sem', res);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(purchaseRecords.count / limit),
      totalItems: purchaseRecords.count,
    };

    return apiResponsePagination(filteredHistoryWithTickets, true, statusCode.success, 'Success', pagination, res);
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};


export const getResult = async (req, res) => {
  try {
    const announce = req.query.announce;

    const whereConditions = {
      prizeCategory: ['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'],
    };

    if (announce) {
      whereConditions.announceTime = announce;
    }

    const results = await LotteryResult.findAll({
      where: whereConditions,
      order: [['prizeCategory', 'ASC']],
      attributes: { include: ['createdAt'] },
    });

    const groupedResults = results.reduce((acc, result) => {
      const { prizeCategory, ticketNumber, prizeAmount, announceTime, createdAt } = result;

      let formattedTicketNumbers = Array.isArray(ticketNumber) ? ticketNumber : [ticketNumber];

      if (prizeCategory === 'Second Prize') {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) => ticket.slice(-5));
      } else if (
        prizeCategory === 'Third Prize' ||
        prizeCategory === 'Fourth Prize' ||
        prizeCategory === 'Fifth Prize'
      ) {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) => ticket.slice(-4));
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

        if (prizeCategory === 'First Prize') {
          limitedTicketNumbers = ticketNumbers.slice(0, 1);
        } else if (['Second Prize', 'Third Prize', 'Fourth Prize'].includes(prizeCategory)) {
          limitedTicketNumbers = ticketNumbers.slice(0, 10);
        } else if (prizeCategory === 'Fifth Prize') {
          limitedTicketNumbers = ticketNumbers.slice(0, 50);
        }

        while (limitedTicketNumbers.length < 10 && prizeCategory !== 'First Prize') {
          limitedTicketNumbers.push(limitedTicketNumbers[limitedTicketNumbers.length - 1]);
        }

        return {
          prizeCategory,
          prizeAmount,
          announceTime,
          date,
          ticketNumbers: [...new Set(limitedTicketNumbers)],
        };
      },
    );

    return apiResponseSuccess(data, true, statusCode.success, 'Prize results retrieved successfully.', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};

export const getTicketNumbersByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

    const purchasedTickets = await PurchaseLottery.findAll({
      where: { marketId: marketId },
      attributes: ["generateId", "userId", "userName", "group", "series", "number", "sem", "marketName"],
    });

    if (purchasedTickets.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.notFound,
        "No tickets purchased for this market",
        res
      );
    }

    const ticketsWithFullNumbers = purchasedTickets.map(ticket => {
      const ticketService = new TicketService(ticket.group, ticket.series, ticket.number, ticket.sem);

      const ticketList = ticketService.list(); 

      const formattedTicketList = ticketList.map(ticketNumber => {
        const [group, series, number] = ticketNumber.split(' ');
        return `${group} ${series} ${number}`;
      });

      return {
        generateId: ticket.generateId,
        userId: ticket.userId,
        userName: ticket.userName,
        sem: ticket.sem,
        marketName: ticket.marketName,
        ticketList: formattedTicketList,  
      };
    });

    return apiResponseSuccess(
      { tickets: ticketsWithFullNumbers },
      true,
      statusCode.success,
      "Ticket details fetched successfully",
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

export const getAllMarkets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticketData = await TicketRange.findAll({
      attributes: ["marketId", "marketName"],
      where: {
        createdAt: {
          [Op.gte]: today,
        },
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
