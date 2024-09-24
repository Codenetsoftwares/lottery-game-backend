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
        const last5DigitUsed = new Set(); // To track used last 5 digits
        const last4DigitUsed = new Set(); // To track used last 4 digits

        // Create maps to store last digits matches for prizes
        const last5DigitMap = new Map();
        const last4DigitMap = new Map();

        // Loop through each lottery ticket
        lotteries.forEach(lottery => {
            const ticketNumbers = lottery.ticketNumber; // Assuming this is an array

            ticketNumbers.forEach(ticket => {
                const [group, series, number] = ticket.split(' ');

                // Check for first prize (non-purchased ticket)
                if (!lottery.isPurchased && !firstPrize) {
                    firstPrize = ticket; // Assign the full ticket number as first prize
                    winningTickets.add(ticket); // Add to winning tickets
                    last5DigitUsed.add(number.slice(-5)); // Mark last 5 digits as used
                }

                // Prepare for second and third prizes (based on last 5 digits)
                const last5Digits = number.slice(-5);
                const last4Digits = number.slice(-4);

                // Second and Third Prize Eligibility
                if (!lottery.isPurchased) {
                    if (!last5DigitMap.has(last5Digits)) {
                        last5DigitMap.set(last5Digits, []);
                    }
                    last5DigitMap.get(last5Digits).push(ticket);
                } else {
                    if (Math.random() < 0.05) { // 5% chance for purchased tickets
                        if (!last5DigitMap.has(last5Digits)) {
                            last5DigitMap.set(last5Digits, []);
                        }
                        last5DigitMap.get(last5Digits).push(ticket);
                    }
                }

                // Fourth and Fifth Prize Eligibility (based on last 4 digits)
                if (!lottery.isPurchased) {
                    if (!last4DigitMap.has(last4Digits)) {
                        last4DigitMap.set(last4Digits, []);
                    }
                    last4DigitMap.get(last4Digits).push(ticket);
                } else {
                    if (Math.random() < 0.05) { // 5% chance for purchased tickets
                        if (!last4DigitMap.has(last4Digits)) {
                            last4DigitMap.set(last4Digits, []);
                        }
                        last4DigitMap.get(last4Digits).push(ticket);
                    }
                }
            });
        });

        // Determine winners for second prize
        for (const [key, value] of last5DigitMap) {
            const uniqueTickets = value.filter(ticket => !winningTickets.has(ticket));
            for (const ticket of uniqueTickets) {
                const last5Digits = ticket.split(' ').slice(-1)[0]; // Get last 5 digits
                if (secondPrize.size < 10 && !winningTickets.has(ticket) && !last5DigitUsed.has(last5Digits)) {
                    secondPrize.add(last5Digits); // Add last 5 digits to second prize
                    winningTickets.add(ticket); // Mark this ticket as won
                    last5DigitUsed.add(last5Digits); // Mark last 5 digits as used
                }
            }
        }

        // Determine winners for third prize
        for (const [key, value] of last5DigitMap) {
            const uniqueTickets = value.filter(ticket => !winningTickets.has(ticket));
            for (const ticket of uniqueTickets) {
                const last5Digits = ticket.split(' ').slice(-1)[0]; // Get last 5 digits
                if (thirdPrize.size < 10 && !winningTickets.has(ticket) && !last5DigitUsed.has(last5Digits)) {
                    thirdPrize.add(last5Digits); // Add last 5 digits to third prize
                    winningTickets.add(ticket); // Mark this ticket as won
                    last5DigitUsed.add(last5Digits); // Mark last 5 digits as used
                }
            }
        }

        // Determine winners for fourth prize (based on last 4 digits)
        for (const [key, value] of last4DigitMap) {
            const uniqueTickets = value.filter(ticket => !winningTickets.has(ticket));
            for (const ticket of uniqueTickets) {
                const last4Digits = ticket.split(' ').slice(-1)[0]; // Get last 4 digits
                if (fourthPrize.size < 10 && !winningTickets.has(ticket) && !last4DigitUsed.has(last4Digits)) {
                    fourthPrize.add(last4Digits); // Add last 4 digits to fourth prize
                    winningTickets.add(ticket); // Mark this ticket as won
                    last4DigitUsed.add(last4Digits); // Mark last 4 digits as used
                }
            }
        }

        // Determine winners for fifth prize (based on last 4 digits)
        for (const [key, value] of last4DigitMap) {
            const uniqueTickets = value.filter(ticket => !winningTickets.has(ticket));
            for (const ticket of uniqueTickets) {
                const last4Digits = ticket.split(' ').slice(-1)[0]; // Get last 4 digits
                if (fifthPrize.size < 50 && !winningTickets.has(ticket) && !last4DigitUsed.has(last4Digits)) {
                    fifthPrize.add(last4Digits); // Add last 4 digits to fifth prize
                    winningTickets.add(ticket); // Mark this ticket as won
                    last4DigitUsed.add(last4Digits); // Mark last 4 digits as used
                }
            }
        }

        // Format the response
        const response = {
            data: {
                firstPrize: firstPrize, // Full ticket number for first prize
                secondPrize: [...secondPrize],
                thirdPrize: [...thirdPrize],
                fourthPrize: [...fourthPrize].map(num => num.slice(-4)), // Ensure last 4 digits only
                fifthPrize: [...fifthPrize].map(num => num.slice(-4)).slice(0, 50) // Ensure last 4 digits only and limit to 50
            },
            success: true,
            successCode: statusCode.success,
            message: "Lottery ticket draw successfully"
        };

        return apiResponseSuccess(response.data, true, statusCode.success, "Lottery ticket draw successfully", res);
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


