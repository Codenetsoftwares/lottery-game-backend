import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { string } from '../constructor/string.js';
import { statusCode } from '../utills/statusCodes.js';
import { apiResponseErr } from '../utills/response.js';
dotenv.config();

export const authenticateUser = (req, res, next) => {
    console.log("..............");
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Access denied. No token provided.', res)
    }
    console.log("authHeader", authHeader);
    const token = authHeader.split(' ')[1];
    console.log("token", token);

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized Access', res)
        }
        console.log("decoded", decoded)

        const role = string.User
        const userRole = decoded.roles;
        if (!role.includes(userRole)) {
            return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized Access', res)
        }

        req.user = decoded;
        next();
    });
};
