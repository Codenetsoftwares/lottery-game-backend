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
