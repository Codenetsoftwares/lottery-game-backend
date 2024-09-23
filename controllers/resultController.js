import Lottery from "../models/lotteryModel.js";
import Result from "../models/resultModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";



export const drawLottery = async (req, res) => {
    try {
        const lotteries = await Lottery.findAll(); // Fetch all lottery tickets

        // Initialize prize arrays
        let firstPrize = null;
        const secondPrize = [];
        const thirdPrize = [];
        const fourthPrize = [];
        const fifthPrize = [];

        // Sets to track winning ticket numbers
        const winningTickets = new Set();

        // Create maps to store last digits matches for prizes
        const last5DigitMap = new Map();
        const last4DigitMap = new Map();

        // Loop through each lottery ticket
        lotteries.forEach(lottery => {
            const ticketNumbers = lottery.ticketNumber; // Assuming this is an array

            ticketNumbers.forEach(ticket => {
                const [group, series, number] = ticket.split(' ');

                // Check for first prize
                if (!lottery.isPurchased && !firstPrize) {
                    firstPrize = ticket; // Assign first prize if not already assigned
                    winningTickets.add(ticket); // Add to winning tickets
                }

                // Prepare for second and third prizes
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

                // Fourth and Fifth Prize Eligibility
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
                if (secondPrize.length < 10) {
                    secondPrize.push(last5Digits); // Add last 5 digits to second prize
                    winningTickets.add(ticket); // Mark this ticket as won
                }
            }
        }

        // Determine winners for third prize
        for (const [key, value] of last5DigitMap) {
            const uniqueTickets = value.filter(ticket => !winningTickets.has(ticket));
            for (const ticket of uniqueTickets) {
                const last5Digits = ticket.split(' ').slice(-1)[0]; // Get last 5 digits
                if (thirdPrize.length < 10) {
                    thirdPrize.push(last5Digits); // Add last 5 digits to third prize
                    winningTickets.add(ticket); // Mark this ticket as won
                }
            }
        }

        // Determine winners for fourth prize
        for (const [key, value] of last4DigitMap) {
            // Select unique tickets for fourth prize
            for (const ticket of value) {
                if (fourthPrize.length < 10 && !winningTickets.has(ticket)) {
                    fourthPrize.push(ticket.slice(-4)); // Add last 4 digits
                    winningTickets.add(ticket); // Mark this ticket as won
                }
            }
        }

        // Determine winners for fifth prize
        for (const [key, value] of last4DigitMap) {
            // Select unique tickets for fifth prize
            for (const ticket of value) {
                if (fifthPrize.length < 50 && !winningTickets.has(ticket)) {
                    fifthPrize.push(ticket.slice(-4)); // Add last 4 digits
                    winningTickets.add(ticket); // Mark this ticket as won
                }
            }
        }

        // Construct response
        const response = {
            firstPrize: firstPrize ? firstPrize : "No winners",
            secondPrize: secondPrize, // Show last 5 digits
            thirdPrize: thirdPrize, // Show last 5 digits
            fourthPrize: fourthPrize.map(num => num), // Show last 4 digits
            fifthPrize: fifthPrize.map(num => num), // Show last 4 digits
        };

        return apiResponseSuccess(
            response,
            true,
            statusCode.success,
            "Lottery ticket draw successfully",
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



  
  
  
  
  
  
  

  
  