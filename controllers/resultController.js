import Lottery from "../models/lotteryModel.js";
import Result from "../models/resultModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";

export const drawLottery = async (req, res) => {
    try {
        const lotteries = await Lottery.findAll(); // Fetch all lottery tickets

        // Initialize prize variables
        let firstPrize = null;
        const secondPrize = new Set();
        const thirdPrize = new Set();
        const fourthPrize = new Set();
        const fifthPrize = new Set();

        // Set to track winning ticket numbers and last digits to avoid duplicates
        const winningTickets = new Set();

        // Loop through each lottery ticket
        lotteries.forEach(lottery => {
            const ticketNumbers = lottery.ticketNumber; // Assuming this is an array

            // Check for first prize (non-purchased ticket)
            if (!lottery.isPurchased && !firstPrize) {
                // Select the first available non-purchased ticket as the first prize
                firstPrize = ticketNumbers[0]; // Assuming you want the first ticket from the array
                winningTickets.add(firstPrize); // Add to winning tickets
            }

            // Process other prizes based on ticket numbers
            ticketNumbers.forEach(ticket => {
                const last5Digits = ticket.slice(-5);
                const last4Digits = ticket.slice(-4);

                // Second Prize Eligibility
                if (!lottery.isPurchased && secondPrize.size < 10 && !winningTickets.has(ticket)) {
                    secondPrize.add(last5Digits);
                    winningTickets.add(ticket);
                }

                // Third Prize Eligibility
                if (!lottery.isPurchased && thirdPrize.size < 10 && !winningTickets.has(ticket)) {
                    thirdPrize.add(last5Digits);
                    winningTickets.add(ticket);
                }

                // Fourth Prize Eligibility
                if (!lottery.isPurchased && fourthPrize.size < 10 && !winningTickets.has(ticket)) {
                    fourthPrize.add(last4Digits);
                    winningTickets.add(ticket);
                }

                // Fifth Prize Eligibility
                if (!lottery.isPurchased && fifthPrize.size < 50 && !winningTickets.has(ticket)) {
                    fifthPrize.add(last4Digits);
                    winningTickets.add(ticket);
                }
            });
        });

        // Format the response
        const response = {
            data: {
                firstPrize: firstPrize, // Full ticket number for first prize
                secondPrize: [...secondPrize],
                thirdPrize: [...thirdPrize],
                fourthPrize: [...fourthPrize],
                fifthPrize: [...fifthPrize]
            },
            success: true,
            successCode: 200,
            message: "Lottery ticket draw successfully"
        };

        return apiResponseSuccess(response.data, true, 200, "Lottery ticket draw successfully", res);
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

