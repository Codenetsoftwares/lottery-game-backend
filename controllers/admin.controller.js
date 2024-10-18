import Admin from "../models/adminModel.js";
import { apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import { statusCode } from "../utils/statusCodes.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
      adminId: uuidv4(),
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
      adminId: existingUser.adminId, // assuming 'id' is the primary key
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
