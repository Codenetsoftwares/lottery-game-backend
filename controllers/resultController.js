import Lottery from '../models/lotteryModel.js';
import Result from '../models/resultModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utills/response.js';
import { statusCode } from '../utills/statusCodes.js';
import { Op } from 'sequelize';

export const drawLottery = async (req, res) => {
  try {
    const { drawDate, drawTime } = req.body;

    // Validate if drawDate and drawTime are provided
    if (!drawDate || !drawTime) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Draw date and draw time are required', res);
    }

    // Fetch lotteries based on drawDate and drawTime
    const lotteries = await Lottery.findAll({
      where: { drawDate: drawDate, drawTime: drawTime }, // Adjust the query to include both drawDate and drawTime
    });

    if (lotteries.length === 0) {
      return apiResponseSuccess(null, false, statusCode.notFound, 'No lotteries found for the given date and time', res);
    }

    // Initialize prize variables
    let firstPrize = null;
    const secondPrize = new Set();
    const thirdPrize = new Set();
    const fourthPrize = new Set();
    const fifthPrize = new Set();

    // Prize amounts
    const firstPrizeAmount = 10000000.0; // 1 crore
    const secondPrizeAmount = 9000.0;
    const thirdPrizeAmount = 450.0;
    const fourthPrizeAmount = 250.0;
    const fifthPrizeAmount = 120.0;

    const winningTickets = new Set();
    const last5DigitUsed = new Set(); // To track used last 5 digits
    const last4DigitUsed = new Set(); // To track used last 4 digits

    const last5DigitMap = new Map();
    const last4DigitMap = new Map();

    lotteries.forEach((lottery) => {
      const ticketNumbers = lottery.ticketNumber;

      ticketNumbers.forEach((ticket) => {
        const [group, series, number] = ticket.split(' ');

        // First prize logic
        if (!lottery.isPurchased && !firstPrize) {
          firstPrize = ticket;
          winningTickets.add(ticket);
          last5DigitUsed.add(number.slice(-5));
        }

        const last5Digits = number.slice(-5);
        const last4Digits = number.slice(-4);

        // Mapping last 5 digits for second and third prize logic
        if (!lottery.isPurchased) {
          if (!last5DigitMap.has(last5Digits)) {
            last5DigitMap.set(last5Digits, []);
          }
          last5DigitMap.get(last5Digits).push(ticket);
        } else {
          if (Math.random() < 0.05) {
            if (!last5DigitMap.has(last5Digits)) {
              last5DigitMap.set(last5Digits, []);
            }
            last5DigitMap.get(last5Digits).push(ticket);
          }
        }

        // Mapping last 4 digits for fourth and fifth prize logic
        if (!lottery.isPurchased) {
          if (!last4DigitMap.has(last4Digits)) {
            last4DigitMap.set(last4Digits, []);
          }
          last4DigitMap.get(last4Digits).push(ticket);
        } else {
          if (Math.random() < 0.05) {
            if (!last4DigitMap.has(last4Digits)) {
              last4DigitMap.set(last4Digits, []);
            }
            last4DigitMap.get(last4Digits).push(ticket);
          }
        }
      });
    });

    // Second prize winners
    for (const [key, value] of last5DigitMap) {
      const uniqueTickets = value.filter((ticket) => !winningTickets.has(ticket));
      for (const ticket of uniqueTickets) {
        const last5Digits = ticket.split(' ').slice(-1)[0];
        if (secondPrize.size < 10 && !winningTickets.has(ticket) && !last5DigitUsed.has(last5Digits)) {
          secondPrize.add(last5Digits);
          winningTickets.add(ticket);
          last5DigitUsed.add(last5Digits);
        }
      }
    }

    // Third prize winners
    for (const [key, value] of last5DigitMap) {
      const uniqueTickets = value.filter((ticket) => !winningTickets.has(ticket));
      for (const ticket of uniqueTickets) {
        const last5Digits = ticket.split(' ').slice(-1)[0];
        if (thirdPrize.size < 10 && !winningTickets.has(ticket) && !last5DigitUsed.has(last5Digits)) {
          thirdPrize.add(last5Digits);
          winningTickets.add(ticket);
          last5DigitUsed.add(last5Digits);
        }
      }
    }

    // Fourth prize winners (match last 4 digits)
    for (const [key, value] of last4DigitMap) {
      const uniqueTickets = value.filter((ticket) => !winningTickets.has(ticket));
      for (const ticket of uniqueTickets) {
        const last4Digits = ticket.split(' ').slice(-1)[0].slice(-4);
        if (fourthPrize.size < 10 && !winningTickets.has(ticket) && !last4DigitUsed.has(last4Digits)) {
          fourthPrize.add(last4Digits);
          winningTickets.add(ticket);
          last4DigitUsed.add(last4Digits);
        }
      }
    }

    // Fifth prize winners (match last 4 digits, up to 50 winners)
    for (const [key, value] of last4DigitMap) {
      const uniqueTickets = value.filter((ticket) => !winningTickets.has(ticket));
      for (const ticket of uniqueTickets) {
        const last4Digits = ticket.split(' ').slice(-1)[0].slice(-4);
        if (fifthPrize.size < 50 && !winningTickets.has(ticket) && !last4DigitUsed.has(last4Digits)) {
          fifthPrize.add(last4Digits);
          winningTickets.add(ticket);
          last4DigitUsed.add(last4Digits);
        }
      }
    }

    // Save result with drawTime
    const result = await Result.create({
      lotteryId: lotteries[0].lotteryId,
      winningTicket: firstPrize,
      firstPrizeWinners: [firstPrize],
      firstPrizeAmount: firstPrizeAmount,
      secondPrizeWinners: [...secondPrize],
      thirdPrizeWinners: [...thirdPrize],
      fourthPrizeWinners: [...fourthPrize],
      fifthPrizeWinners: [...fifthPrize],
      drawDate: drawDate,
      drawTime: drawTime, // Include drawTime when saving the result
    });

    // Prepare the response
    const response = {
      data: {
        firstPrize: {
          amount: firstPrizeAmount,
          ticket: firstPrize,
        },
        secondPrize: {
          amount: secondPrizeAmount,
          tickets: [...secondPrize],
        },
        thirdPrize: {
          amount: thirdPrizeAmount,
          tickets: [...thirdPrize],
        },
        fourthPrize: {
          amount: fourthPrizeAmount,
          tickets: [...fourthPrize].map((ticket) => ticket.slice(-4)), // Extract last 4 digits for fourth prize
        },
        fifthPrize: {
          amount: fifthPrizeAmount,
          tickets: [...fifthPrize].map((ticket) => ticket.slice(-4)).slice(0, 50), // Extract last 4 digits for fifth prize, limit to 50
        },
      },
      success: true,
      successCode: statusCode.success,
      message: 'Lottery ticket draw successfully',
    };

    return apiResponseSuccess(response.data, true, statusCode.success, 'Lottery ticket draw successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};


export const getResults = async (req, res) => {
  const { resultId } = req.params;

  try {
    const result = await Result.findOne({
      where: { resultId },
    });

    if (!result) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Result not found', res);
    }

    const response = {
      data: {
        firstPrize: {
          amount: result.firstPrizeAmount,
          ticket: result.winningTicket || null,
        },
        secondPrize: {
          amount: result.secondPrizeAmountPerSem,
          tickets: result.secondPrizeWinners || [],
        },
        thirdPrize: {
          amount: result.thirdPrizeAmountPerSem,
          tickets: result.thirdPrizeWinners || [],
        },
        fourthPrize: {
          amount: result.fourthPrizeAmountPerSem,
          tickets: result.fourthPrizeWinners || [],
        },
        fifthPrize: {
          amount: result.fifthPrizeAmountPerSem,
          tickets: result.fifthPrizeWinners || [],
        },
      },
      success: true,
      successCode: 200,
      message: 'Lottery results fetched successfully',
    };
    return apiResponseSuccess(response.data, true, statusCode.success, 'Lottery results fetched successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};

export const getDrawTimes = (req, res) => {
  try {
    const drawTimes = ['10:00 A.M.', '1:00 P.M.', '6:00 P.M.', '8:00 P.M.'];
    return apiResponseSuccess(drawTimes, true, statusCode.success, 'drawTimes fetched successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};


export const getOldResults = async (req, res) => {
  const { drawDate, drawTime } = req.query;

  if (!drawDate || !drawTime) {
    return apiResponseErr(null, false, statusCode.badRequest, 'drawDate and drawTime are required.', res);
  }

  try {
    const results = await Result.findAll({
      where: {
        drawDate: drawDate,
        drawTime: drawTime,
      },
    });

    if (results.length === 0) {
    return apiResponseErr(null, false, statusCode.badRequest, 'No results found for the given drawDate and drawTime.', res);
    }

    return apiResponseSuccess(results, true, statusCode.success, 'Old result fetched successfully', res);

  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};


