import { generateTickets } from '../helpers/helper.js';
import Ticket from '../models/ticketModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utills/response.js';
import { statusCode } from '../utills/statusCodes.js';


export const generateTicket = async (req, res) => {
  const { group, series, number } = req.body; // Get group, series, and number from the request body
  const sem = parseInt(req.params.sem); // Parse the sem value from the request parameters

  const validSems = [5, 10, 25, 50, 100, 200];
  const validSeries = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L']; // Excludes 'F' and 'I'

  // Check if the sem value is valid
  if (!validSems.includes(sem)) {
    return apiResponseErr(null, false, statusCode.badRequest, 'Invalid sem value', res);
  }

  // Validate input values
  if (
    !group || !series || !number || 
    group < 38 || group > 99 || 
    !validSeries.includes(series) || 
    number.length !== 5
  ) {
    return apiResponseErr(null, false, statusCode.badRequest, 'Invalid group, series, or number format', res);
  }

  try {
    const tickets = []; // Array to hold the generated tickets
    let currentGroup = group; // Initialize currentGroup to the input group
    let startSeriesIndex = validSeries.indexOf(series); // Find the starting index for the series
    let ticketPerGroup, groupIncrement;

    // Determine logic based on sem value
    if (sem === 25) {
      ticketPerGroup = 5; // Group increases every 5 tickets
      groupIncrement = 1;
    } else if (sem === 50 || sem === 100 || sem === 200) {
      ticketPerGroup = 10; // Group increases every 10 tickets
      groupIncrement = 1;
    } else {
      ticketPerGroup = sem; // For sem 5 and 10, we handle them with the sem value
      groupIncrement = 0;
    }

    // Generate tickets based on the sem value
    for (let i = 0; i < sem; i++) {
      // Adjust group and series based on sem logic
      if (i > 0 && i % ticketPerGroup === 0) {
        currentGroup += groupIncrement; // Increase group after every 'ticketPerGroup' tickets
        startSeriesIndex = 0; // Reset series index for every new group
      }

      const currentSeries = validSeries[(startSeriesIndex + (i % ticketPerGroup)) % validSeries.length]; // Get the current series based on the logic
      const ticketNumber = `${currentGroup} ${currentSeries} ${number}`; // Format the ticket number
      tickets.push(ticketNumber); // Store each ticket number as a string in the array
    }

    // Create a new ticket entry in the database
    const ticketEntry = {
      ticketNumber: tickets, // Store the tickets as an array of strings
      sem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save tickets in the database
    await Ticket.create(ticketEntry);

    return apiResponseSuccess(
      { tickets }, // Return tickets as an array of strings
      true,
      statusCode.create,
      `${sem} Sem ticketNumbers generated successfully with user input`,
      res
    );
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};





