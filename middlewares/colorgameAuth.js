import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { string } from '../constructor/string.js';
import { apiResponseErr } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
dotenv.config();

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return apiResponseErr(null, false, statusCode.unauthorize, 'Access denied. No token provided.', res);
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized Access', res);
    }

    const role = string.User;
    console.log('role', role);
    const userRole = decoded.roles;
    console.log('userRole', userRole);

    if (!role.includes(userRole)) {
      return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized Access', res);
    }

    req.user = decoded;
    next();
  });
};
