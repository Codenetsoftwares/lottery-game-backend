import { generateTicketNumber } from "../helpers/helper.js";
import Lottery from "../models/lotteryModel.js";
import Ticket from "../models/ticketModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";

// Create Lottery API
export const createLottery = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      firstPrize,
      secondPrize,
      thirdPrize,
      fourthPrize,
      fifthPrize,
      sem,
      price,
    } = req.body;

    // Find an available ticket from the Ticket table
    const ticket = await Ticket.findOne({
      where: {
        used: false, // Assuming you have a 'used' flag to indicate if a ticket has already been assigned to a lottery
      },
    });

    if (!ticket) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "No available ticket found",
        res
      );
    }

    // Create and save the lottery in the database with the found ticket number
    const lottery = await Lottery.create({
      name,
      startDate,
      endDate,
      firstPrize,
      secondPrize,
      thirdPrize,
      fourthPrize,
      fifthPrize,
      ticketNumber: ticket.ticketNumber,
      sem,
      price,
    });

    // Mark the ticket as used
    ticket.used = true;
    await ticket.save();

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
    const lotteries = await Lottery.findAll();

    return apiResponseSuccess(
      lotteries,
      true,
      statusCode.success,
      "Lotteries retrieved successfully",
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

    return apiResponseSuccess(
      lottery,
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

export const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the ID to ensure it is being passed correctly
    console.log(`Received ID: ${id}`);

    // Find the ticket
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      console.log(`Ticket with ID ${id} not found`);
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Ticket not found",
        res
      );
    }

    // Log the ticket details for debugging
    console.log('Ticket found:', ticket);

    // Find the lottery associated with the ticket
    const lottery = await Lottery.findOne({
      where: { lotteryId: ticket.lotteryId }, // Correct reference
    });

    if (!lottery) {
      console.log(`Lottery with ID ${ticket.lotteryId} not found`);
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Lottery associated with the ticket not found",
        res
      );
    }

    return apiResponseSuccess(
      {
        ticketNumber: ticket.ticketNumber,
        sem: lottery.sem,
      },
      true,
      statusCode.success,
      "Ticket details retrieved successfully",
      res
    );
  } catch (error) {
    console.error(error); // Log error for debugging
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      "An unexpected error occurred",
      res
    );
  }
};



//purchase lottery
export const purchaseLotteryTicket = async (req, res) => {
  try {
    const { lotteryId, userId } = req.body;

    // Check if the lottery exists
    const lottery = await Lottery.findByPk(lotteryId);
    if (!lottery) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Lottery not found",
        res
      );
    }

    // Generate a unique ticket number
    const ticketNumber = generateTicketNumber();

    // Create and save the ticket in the database
    const ticket = await Ticket.create({
      ticketNumber,
      lotteryId, // Associate the ticket with the lottery
      userId, // Assuming userId comes from the authenticated user or passed in the request
    });
    return apiResponseSuccess(
      ticket,
      true,
      statusCode.create,
      "Ticket purchased successfully",
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
