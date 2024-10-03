import { generateTickets } from '../helpers/helper.js';
import Ticket from '../models/ticketModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utills/response.js';
import { statusCode } from '../utills/statusCodes.js';

export const generateTicket = async (req, res) => {
  const sem = parseInt(req.params.sem);
  const validSems = [5, 10, 25, 50, 100, 200];

  if (!validSems.includes(sem)) {
    return apiResponseErr(null, false, statusCode.badRequest, 'Invalid sem value', res);
  }

  const tickets = generateTickets(sem);
  try {
    const ticketEntry = {
      ticketNumber: tickets,
      sem: sem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await Ticket.create(ticketEntry);

    return apiResponseSuccess(
      { tickets },
      true,
      statusCode.create,
      `${sem} Sem ticketNumber generate successfully`,
      res,
    );
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};
