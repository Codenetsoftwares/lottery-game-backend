import { Op } from 'sequelize';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import TicketRange from '../models/ticketRange.model.js';

export const ResultDeclare = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const prizes = req.body;
    const { marketId } = req.params;
    const market = await TicketRange.findOne({ where: { marketId } });
    const { makerId, checkerId } = req.body;

    if (!market) {
      await transaction.rollback();
      return apiResponseErr(null, false, statusCode.badRequest, 'Market not found', res);
    }

    const marketName = market.marketName;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const prizeLimits = {
      'First Prize': 1,
      'Second Prize': 10,
      'Third Prize': 10,
      'Fourth Prize': 10,
      'Fifth Prize': 50,
    };

    let generatedTickets = [];
    let lastFiveForFirstPrize = null;
    let lastFourForFirstPrize = null;
    let lastFourForSecondPrize = null;
    let lastFourForThirdPrize = null;
    let lastFourForFourthPrize = null;

    // Loop through each prize and declare results
    for (let prize of prizes) {
      const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } = prize;

      // Check prize category validity
      if (!prizeLimits[prizeCategory]) {
        await transaction.rollback();
        return apiResponseErr(null, false, statusCode.badRequest, 'Invalid prize category.', res);
      }

      // Ensure the correct number of tickets for each prize category
      const ticketNumbers = Array.isArray(ticketNumber) ? ticketNumber : [ticketNumber];
      if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
        await transaction.rollback();
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`,
          res,
        );
      }

      // Check for ticket number duplicates across different prize categories
      const allResults = await LotteryResult.findAll({
        where: {
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
          marketId
        }
      });
      const isDuplicate = ticketNumbers.some(ticket =>
        allResults.some(result => result.ticketNumber.includes(ticket))
      );

      if (isDuplicate) {
        await transaction.rollback();
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          'One or more ticket numbers have already been assigned a prize in another category.',
          res,
        );
      }

      // Check if we have already reached the limit for this prize category
      const existingResults = await LotteryResult.findAll({
        where: { prizeCategory, marketId, status: approval.Pending },
      });

      if (existingResults.length >= prizeLimits[prizeCategory]) {
        await transaction.rollback();
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `Cannot add more ticket numbers. ${prizeCategory} already has the required tickets.`,
          res,
        );
      }

      // Handle different prize categories
      if (prizeCategory === 'First Prize') {
        const firstTicket = ticketNumbers[0];
        const lastFive = firstTicket.slice(-5);
        const lastFour = firstTicket.slice(-4);
        lastFiveForFirstPrize = lastFive;
        lastFourForFirstPrize = lastFour
        generatedTickets.push({
          resultId: uuidv4(),
          marketId,
          ticketNumber: ticketNumbers,
          marketName,
          prizeCategory,
          prizeAmount,
          complementaryPrize,
          makerId,
          checkerId,
          status: approval.Pending,
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
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
          });
        } else {
          await transaction.rollback();
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Third Prize') {
        const thirdTicket = ticketNumbers[0];
        const lastFour = thirdTicket.slice(-4);
        if (lastFour !== lastFiveForFirstPrize && lastFour !== lastFourForSecondPrize && lastFour !== lastFourForFirstPrize) {
          lastFourForThirdPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            makerId,
            checkerId,
            status: approval.Pending,
          });
        } else {
          await transaction.rollback();
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Fourth Prize') {
        const fourthTicket = ticketNumbers[0];
        const lastFour = fourthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          lastFourForFourthPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            makerId,
            checkerId,
            status: approval.Pending,
          });
        } else {
          await transaction.rollback();
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Fifth Prize') {
        const fifthTicket = ticketNumbers[0];
        const lastFour = fifthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFourthPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            makerId,
            checkerId,
            status: approval.Pending,
          });
        } else {
          await transaction.rollback();
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      const matchedTickets = await PurchaseLottery.findAll({
        where: {
          marketId,
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
          [Op.or]: ticketNumbers.map((ticket) => {
            if (prizeCategory === 'First Prize') {
              const [group, series, number] = ticket.split(' ');
              return { group, series, number };
            } else if (prizeCategory === 'Second Prize') {
              return { number: { [Op.like]: `%${ticket.slice(-5)}` } };
            } else {
              return { number: { [Op.like]: `%${ticket.slice(-4)}` } };
            }
          }),
        },
      });

      if (matchedTickets.length > 0) {
        for (const ticket of matchedTickets) {
          const { userId, sem, userName, marketName, number, lotteryPrice } = ticket;
          const totalPrize =
            prizeCategory === 'First Prize'
              ? prizeAmount
              : sem * prizeAmount

          // const matchedTicketLastFive = ticket.ticketNumber.slice(-5);
          // if (matchedTicketLastFive === lastFiveForFirstPrize) {
          //   totalPrize += complementaryPrize; 
          // }
          const baseURL = process.env.COLOR_GAME_URL;
          const response = await axios.post(`${baseURL}/api/users/update-balance`, {
            userId,
            prizeAmount: totalPrize,
            marketId
          });

          const res = await axios.post(`${baseURL}/api/lottery-profit-loss`, {
            userId,
            userName,
            marketId,
            marketName,
            ticketNumber: number,
            price: lotteryPrice,
            sem,
            profitLoss: totalPrize,
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
      } else {
        const usersWithPurchases = await PurchaseLottery.findAll({
          where: { marketId },
          attributes: ['userId', 'marketName'],
        });

        const userIds = [...new Set(usersWithPurchases.map((user) => user.userId))];

        for (const userId of userIds) {
          const baseURL = process.env.COLOR_GAME_URL;
          const response = await axios.post(`${baseURL}/api/users/remove-exposer`, {
            userId,
            marketId,
            marketName,
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
        }
      }
    }

    const savedResults = await LotteryResult.bulkCreate(generatedTickets);

    await PurchaseLottery.update(
      { resultAnnouncement: true },
      { where: { marketId } }
    );

    await TicketRange.update(
      { isActive: false, isWin: true, },
      { where: { marketId } }
    );

    await transaction.commit();
    return apiResponseSuccess(savedResults, true, statusCode.create, 'Lottery results saved successfully.', res);

  } catch (error) {
    await transaction.rollback();
    console.error('Transaction Error:', error);
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};

export const getLotteryResults = async (req, res) => {
  try {
    const { marketId } = req.params;

    const results = await LotteryResult.findAll({
      where: { marketId },
    });

    if (results.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        `No lottery results found.`,
        res
      );
    }

    return apiResponseSuccess(results, true, statusCode.success, 'Lottery results fetched successfully.', res);
  } catch (error) {
    console.log("Error fetching results:", error);
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getMultipleLotteryResults = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await LotteryResult.findAll({
      attributes: ["marketId", "marketName", "ticketNumber", "prizeCategory", "prizeAmount", "complementaryPrize", "createdAt"],
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    if (results.length === 0) {
      return apiResponseSuccess(
        {},
        false,
        statusCode.success,
        `No lottery results found for today.`,
        res
      );
    }

    const structuredResults = {};

    results.forEach((result) => {
      const marketName = result.marketName;
      if (!structuredResults[marketName]) {
        structuredResults[marketName] = [];
      }

      structuredResults[marketName].push({
        ticketNumber: Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber],
        prizeCategory: result.prizeCategory,
        prizeAmount: result.prizeAmount,
        complementaryPrize: result.complementaryPrize || 0,
        marketName: marketName,
        marketId: result.marketId,
      });
    });

    return apiResponseSuccess(
      structuredResults,
      true,
      statusCode.success,
      "Lottery results fetched successfully.",
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

export const getResultByMarketId = async (req, res) => {
  try {
    const { marketId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await LotteryResult.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
        marketId,
      },
      order: [['createdAt', 'DESC']],
    });

    if (!results.length) {
      return apiResponseSuccess([], true, statusCode.success, 'No results found for the specified market.', res);
    }

    return apiResponseSuccess(results, true, statusCode.success, 'Lottery results retrieved successfully.', res);

  } catch (error) {
    console.error('Error fetching lottery results:', error);
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};



