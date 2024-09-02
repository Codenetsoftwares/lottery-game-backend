import Admin from "../models/adminModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utills/response.js";
import { v4 as uuidv4 } from "uuid";
import { statusCode } from "../utills/statusCodes.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Lottery from "../models/lotteryModel.js";
import Ticket from "../models/ticketModel.js";
import Result from "../models/resultModel.js";
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await Admin.findOne({
      where: { userName: userName },
    });

    if (existingAdmin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin already exist",
        res
      );
    }

    const newAdmin = await Admin.create({
      userId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(
      newAdmin,
      true,
      statusCode.create,
      "created successfully",
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

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "User does not exist",
        res
      );
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid username or password",
        res
      );
    }

    const userResponse = {
      userId: existingUser.id, // assuming 'id' is the primary key
      userName: existingUser.userName,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    return apiResponseSuccess(
      {
        accessToken,
        ...userResponse,
      },
      true,
      statusCode.success,
      "login successfully",
      res
    );
  } catch (error) {
    apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    );
  }
};

// export const lotteryDraw = async (req, res) => {
//   const { lotteryId } = req.params;

//   try {
//     // Find the lottery by its ID
//     const lottery = await Lottery.findByPk(lotteryId);
//     if (!lottery) {
//       return apiResponseErr(
//         null,
//         false,
//         statusCode.badRequest,
//         "Lottery not found",
//         res
//       );
//     }

//     // Retrieve all tickets for the specified lottery
//     const tickets = await Ticket.findAll({ where: { lotteryId } });
//     if (tickets.length === 0) {
//       return apiResponseErr(
//         null,
//         false,
//         statusCode.badRequest,
//         "No tickets available for this lottery",
//         res
//       );
//     }

//     // Shuffle the tickets to randomly select potential winners
//     const shuffledTickets = tickets.sort(() => 0.5 - Math.random());

//     // Extract ticket numbers
//     const ticketNumbers = shuffledTickets.map((ticket) => ticket.ticketNumber);

//     // Logic for each prize
//     const firstPrizeTicket = ticketNumbers[0]; // The first shuffled ticket

//     // Find tickets for second to fifth prizes
//     const secondPrizeTicket = ticketNumbers.find(
//       (ticket) =>
//         ticket !== firstPrizeTicket &&
//         ticket.slice(-5) === firstPrizeTicket.slice(-5)
//     );

//     const thirdPrizeTicket = ticketNumbers.find(
//       (ticket) =>
//         ticket !== firstPrizeTicket &&
//         ticket !== secondPrizeTicket &&
//         ticket.slice(-4) === firstPrizeTicket.slice(-4)
//     );

//     const fourthPrizeTicket = ticketNumbers.find(
//       (ticket) =>
//         ticket !== firstPrizeTicket &&
//         ticket !== secondPrizeTicket &&
//         ticket !== thirdPrizeTicket &&
//         ticket.slice(-4) === firstPrizeTicket.slice(-4)
//     );

//     const fifthPrizeTicket = ticketNumbers.find(
//       (ticket) =>
//         ticket !== firstPrizeTicket &&
//         ticket !== secondPrizeTicket &&
//         ticket !== thirdPrizeTicket &&
//         ticket !== fourthPrizeTicket &&
//         ticket.slice(-4) === firstPrizeTicket.slice(-4)
//     );

//     // If any prize ticket is not found, handle accordingly
//     if (
//       !secondPrizeTicket ||
//       !thirdPrizeTicket ||
//       !fourthPrizeTicket ||
//       !fifthPrizeTicket
//     ) {
//       return apiResponseErr(
//         null,
//         false,
//         statusCode.badRequest,
//         "Not enough tickets with matching criteria",
//         res
//       );
//     }

//     // Create the result in the database
//     const result = await Result.create({
//       lotteryId,
//       firstPrizeTicket,
//       secondPrizeTicket,
//       thirdPrizeTicket,
//       fourthPrizeTicket,
//       fifthPrizeTicket,
//     });

//     // Prize amounts for each prize
//     const prizeAmounts = {
//       firstPrize: "Rs 1 Crore",
//       secondPrize: "Rs 9,000",
//       thirdPrize: "Rs 450",
//       fourthPrize: "Rs 250",
//       fifthPrize: "Rs 120",
//     };

//     // Respond with success message and result
//     return res.status(statusCode.success).json({
//       data: {
//         result,
//         prizes: {
//           firstPrize: prizeAmounts.firstPrize,
//           secondPrize: prizeAmounts.secondPrize,
//           thirdPrize: prizeAmounts.thirdPrize,
//           fourthPrize: prizeAmounts.fourthPrize,
//           fifthPrize: prizeAmounts.fifthPrize,
//         },
//       },
//       success: true,
//       responseCode: statusCode.success,
//       errMessage: "Lottery results drawn successfully",
//     });
//   } catch (error) {
//     return apiResponseErr(
//       null,
//       false,
//       statusCode.internalServerError,
//       error.message,
//       res
//     );
//   }
// };
