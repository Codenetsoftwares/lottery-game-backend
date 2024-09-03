import { generateTicketNumber } from "../helpers/helper.js";
import Ticket from "../models/ticketModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";

export const createTicket = async (req, res) => {
  try {
    // Generate a random ticket number
    const ticketNumber = generateTicketNumber();

    // Create and save the ticket in the database
    const ticket = await Ticket.create({
      ticketNumber,
    });
    return apiResponseSuccess(
      ticket,
      true,
      statusCode.create,
      "Ticket created successfully",
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

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll(); // Fetch all tickets
    return apiResponseSuccess(
      tickets,
      true,
      statusCode.success,
      "Tickets retrieved successfully",
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

// Get a ticket by ID
export const getTicketById = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    const ticket = await Ticket.findByPk(id); // Find ticket by primary key (UUID)
    if (!ticket) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "Ticket not found",
        res
      );
    }
    return apiResponseSuccess(
      ticket,
      true,
      statusCode.success,
      "Ticket retrieved successfully",
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
