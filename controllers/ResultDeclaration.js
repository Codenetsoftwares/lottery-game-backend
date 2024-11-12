import { Op } from 'sequelize';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import TicketRange from '../models/ticketRange.model.js';

export const ResultDeclare = async (req, res) => {
  try {
    const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } = req.body;
    const { marketId } = req.params
    const market = await TicketRange.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Market not found', res);
    }
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

    const allResults = await LotteryResult.findAll({
      where: { marketId } 
    });
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
      where: { prizeCategory, marketId }, 
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
        marketId,
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
          marketId,
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
          marketId,
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
          marketId,
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
          marketId,
          ticketNumber: ticketNumbers,
          prizeCategory,
          prizeAmount,
        });
      }
    }
    console.log('Ticket Numbers:', ticketNumbers);
    const matchedTickets = await PurchaseLottery.findAll({
      where: {
        marketId,
        [Op.or]: ticketNumbers.map((ticket) => {
          if (prizeCategory === 'First Prize') {
            // Full ticket match for first prize
            const [group, series, number] = ticket.split(' ');
            return { group, series, number };
          } else if (prizeCategory === 'Second Prize') {
            // Match last 5 digits
            return { number: { [Op.like]: `%${ticket.slice(-5)}` } };
          } else {
            // Match last 4 digits for other prizes
            return { number: { [Op.like]: `%${ticket.slice(-4)}` } };
          }

        }),
      },
    });

    const savedResults = await LotteryResult.bulkCreate(generatedTickets);

    for (const ticket of matchedTickets) {
      const { userId, sem } = ticket;
      const totalPrize =
        prizeCategory === 'First Prize'
          ? prizeAmount
          : sem * prizeAmount;

      const response = await axios.post('http://localhost:7000/api/users/update-balance', {
        userId,
        prizeAmount: totalPrize,
        marketId
      });

      if (!response.data.success) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `Failed to update balance for userId ${userId}.`,
          res
        );
      }

      console.log(`Balance updated for userId ${userId}:`, response.data);
    }

    return apiResponseSuccess(savedResults, true, statusCode.create, 'Lottery results saved successfully.', res);

  } catch (error) {
    console.log("error",error)
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};
