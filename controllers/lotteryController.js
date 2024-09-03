import moment from "moment";
import Lottery from "../models/lotteryModel.js";
import Ticket from "../models/ticketModel.js";
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";
import LotteryPurchase from "../models/lotteryPurchaseModel.js";
import Admin from "../models/adminModel.js";
//import axios from "axios";

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
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Ticket not found",
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
    const { sem, page = 1, pageSize = 10 } = req.query; // Destructure sem, page, and pageSize from query parameters

    const whereConditions = {};

    // Add conditions to the where object based on the provided query parameters
    if (sem) {
      whereConditions.sem = sem; // Filter by sem if provided
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Retrieve lotteries with pagination
    const lotteries = await Lottery.findAndCountAll({
      where: whereConditions, // Use the where object in the query
      limit: parseInt(pageSize), // Limit the number of records returned
      offset: parseInt(offset), // Offset for pagination
    });

    // Prepare pagination details
    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      totalPages: Math.ceil(lotteries.count / pageSize),
      totalItems: lotteries.count,
    };

    // Use the custom pagination response format
    return apiResponsePagination(
      lotteries.rows, // Paginated lotteries
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

    // Find lottery by lotteryId (UUID)
    const lottery = await Lottery.findOne({
      where: { lotteryId }, // Assuming 'lotteryId' is the column name
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

    // Calculate lottery amount (sem * price)
    const lotteryAmount = lottery.price * lottery.sem; // Assuming 'price' and 'sem' are columns in the Lottery model

    // Include the lottery amount in the response
    const responsePayload = {
      // Convert the lottery instance to a plain object
      lotteryAmount, // Add the calculated lottery amount
    };

    return apiResponseSuccess(
      responsePayload,
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


export const purchaseLotteryTicket = async (req, res) => {
  try {
    const { userId, lotteryId } = req.body;
    // Validate user existence by making a request to the external user application
    // const userResponse = await axios.get(`https://user-app.com/api/users/${userId}`);
    // if (!userResponse.data.success) {
    //   return apiResponseErr(
    //     null,
    //     false,
    //     statusCode.notFound,
    //     "User not found",
    //     res
    //   );
    // }


    // Check if the lottery exists
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

    // Check if the ticket has already been purchased
    const existingPurchase = await LotteryPurchase.findOne({
      where: { lotteryId, ticketNumber: lottery.ticketNumber },
    });

    if (existingPurchase) {
      return apiResponseErr(
        null,
        false,
        statusCode.conflict,
        "This ticket has already been purchased",
        res
      );
    }

    // Create the lottery purchase
    const purchase = await LotteryPurchase.create({
      userId,
      lotteryId,
      ticketNumber: lottery.ticketNumber,
    });

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


