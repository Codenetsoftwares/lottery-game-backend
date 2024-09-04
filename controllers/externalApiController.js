import Lottery from "../models/lotteryModel.js";
import { apiResponseErr, apiResponsePagination } from "../utills/response.js";
import { statusCode } from "../utills/statusCodes.js";

    export const getAllExternalLotteries = async (req, res) => {
        try {
          const { sem, page = 1, pageSize = 10 } = req.query; // Destructure sem, page, and pageSize from query parameters
      
          const whereConditions = {};
      
          // Add conditions to the where object based on the provided query parameters
          if (sem) {
            whereConditions.sem = sem; // Filter by sem if provided
          }
      
          // Calculate offset for pagination
          const offset = (page - 1) * pageSize;
      
          // Retrieve lotteries with pagination
          const lotteries = await Lottery.findAndCountAll({
            where: whereConditions, // Use the where object in the query
            limit: parseInt(pageSize), // Limit the number of records returned
            offset: parseInt(offset), // Offset for pagination
          });
      
          // Prepare pagination details
          const pagination = {
            page: parseInt(page),
            limit: parseInt(pageSize),
            totalPages: Math.ceil(lotteries.count / pageSize),
            totalItems: lotteries.count,
          };
      
          // Use the custom pagination response format
          return apiResponsePagination(
            lotteries.rows, // Paginated lotteries
            true,
            statusCode.success,
            "Lotteries retrieved successfully",
            pagination,
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
