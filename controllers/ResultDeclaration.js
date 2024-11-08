import LotteryResult from '../models/resultModel.js';
import UserRange from '../models/user.model.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes';

export const ResultDeclare = async (req, res) => {
  try {
    const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } = req.body;

    const prizeLimits = {
      'First Prize': 1,
      'Second Prize': 10,
      'Third Prize': 10,
      'Fourth Prize': 10,
      'Fifth Prize': 50,
    };

    if (!prizeLimits[prizeCategory]) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Invalid prize category.', res);
    }

    const ticketNumbers = Array.isArray(ticketNumber) ? ticketNumber : [ticketNumber];
    if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`,
        res,
      );
    }

    const allResults = await LotteryResult.findAll();
    const isDuplicate = ticketNumbers.some((ticket) =>
      allResults.some((result) => result.ticketNumber.includes(ticket)),
    );

    if (isDuplicate) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'One or more ticket numbers have already been assigned a prize in another category.',
        res,
      );
    }

    const existingResults = await LotteryResult.findAll({
      where: { prizeCategory: prizeCategory },
    });
    if (existingResults.length >= prizeLimits[prizeCategory]) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        `Cannot add more ticket numbers. ${prizeCategory} already has the required tickets.`,
        res,
      );
    }

    let lastFiveForFirstPrize = null;
    let lastFourForSecondPrize = null;
    let lastFourForThirdPrize = null;
    let lastFourForFourthPrize = null;

    const generatedTickets = [];

    if (prizeCategory === 'First Prize') {
      const firstTicket = ticketNumbers[0];
      const lastFive = firstTicket.slice(-5);
      lastFiveForFirstPrize = lastFive;
      generatedTickets.push({
        resultId: uuidv4(),
        ticketNumber: ticketNumbers,
        prizeCategory,
        prizeAmount,
        complementaryPrize,
      });
    }

    if (prizeCategory === 'Second Prize') {
      const secondTicket = ticketNumbers[0];
      const lastFive = secondTicket.slice(-5);
      if (lastFive !== lastFiveForFirstPrize) {
        lastFourForSecondPrize = lastFive;
        generatedTickets.push({
          resultId: uuidv4(),
          ticketNumber: ticketNumbers,
          prizeCategory,
          prizeAmount,
        });
      }
    }

    if (prizeCategory === 'Third Prize') {
      const thirdTicket = ticketNumbers[0];
      const lastFour = thirdTicket.slice(-4);

      if (lastFour !== lastFiveForFirstPrize && lastFour !== lastFourForSecondPrize) {
        lastFourForThirdPrize = lastFour;
        generatedTickets.push({
          resultId: uuidv4(),
          ticketNumber: ticketNumbers,
          prizeCategory,
          prizeAmount,
        });
      }
    }

    if (prizeCategory === 'Fourth Prize') {
      const fourthTicket = ticketNumbers[0];
      const lastFour = fourthTicket.slice(-4);
      if (
        lastFour !== lastFiveForFirstPrize &&
        lastFour !== lastFourForSecondPrize &&
        lastFour !== lastFourForThirdPrize
      ) {
        lastFourForFourthPrize = lastFour;
        generatedTickets.push({
          resultId: uuidv4(),
          ticketNumber: ticketNumbers,
          prizeCategory,
          prizeAmount,
        });
      }
    }

    if (prizeCategory === 'Fifth Prize') {
      const fifthTicket = ticketNumbers[0];
      const lastFour = fifthTicket.slice(-4);
      if (
        lastFour !== lastFiveForFirstPrize &&
        lastFour !== lastFourForSecondPrize &&
        lastFour !== lastFourForThirdPrize &&
        lastFour !== lastFourForFourthPrize
      ) {
        generatedTickets.push({
          resultId: uuidv4(),
          ticketNumber: ticketNumbers,
          prizeCategory,
          prizeAmount,
        });
      }
    }

    const savedResults = await LotteryResult.bulkCreate(generatedTickets);

    const userTicket = await UserRange.findAll();
    return apiResponseSuccess(savedResults, true, statusCode.create, 'Lottery results saved successfully.', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};
