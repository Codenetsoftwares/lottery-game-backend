import jwt from 'jsonwebtoken';
import { string } from '../constructor/string.js';
import { statusCode } from '../utills/statusCodes.js';
import { apiResponseErr } from '../utills/response.js';
import Admin from '../models/adminModel.js';


// const tokenBlacklist = new Set();

export const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const authToken = req?.headers?.authorization;
      if (!authToken) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorize', res);
      }

      const tokenParts = authToken.split(' ');
      if (tokenParts.length !== 2 || !(tokenParts[0] === 'Bearer' && tokenParts[1])) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Invalid token format', res);
      }

      // const token = tokenParts[1];
      // let decodedUser;
      // try {
      //   decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // } catch (error) {
      //   return apiResponseErr(null, false, statusCode.unauthorize, 'Token verification failed', res);
      // }

      // if (!decodedUser) {
      //   return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized access: No user decoded from token', res);
      // }

      let user;
      try {
        user = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
      } catch (error) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Token verification failed', res);
      }

      if (!user) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          'Unauthorized access: No user decoded from token',
          res,
        );
      }

      let existingUser;

      if (roles.includes(string.Admin)) {
        existingUser = await Admin.findOne({
          where: {
            adminId: user.adminId,
          },
        });
      }

      if (roles.includes(string.SubAdmin)) {
        existingUser = await Admin.findOne({
          where: {
            adminId: user.adminId,
          },
        });
      }

      // if (roles.includes(string.Maker)) {
      //   existingUser = await User.findOne({
      //     where: {
      //       userId: user.userId,
      //     },
      //   });
      // }

      // if (roles.includes(string.Checker)) {
      //   existingUser = await User.findOne({
      //     where: {
      //       userId: user.userId,
      //     },
      //   });
      // }

      // if (roles.includes(string.Carrier)) {
      //   existingUser = await User.findOne({
      //     where: {
      //       userId: user.userId,
      //     },
      //   });
      // }

      if (!existingUser) {
        return apiResponseErr(
          null,
          false,
          statusCode.unauthorize,
          'Unauthorized access: User not found in database',
          res,
        );
      }

      const rolesArray = existingUser.role ? existingUser.role.split(',') : [];

      if (roles && roles.length > 0) {
        const userHasRequiredRole = roles.some((role) => rolesArray.includes(role));

        if (!userHasRequiredRole) {
          return apiResponseErr(
            rolesArray,
            false,
            statusCode.unauthorize,
            'Unauthorized access: User does not have required role',
            res,
          );
        }
      }

      (req.user = existingUser),
        //  { accessToken: token };
        next();
    } catch (error) {
      return apiResponseErr(
        null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message,
        res,
      );
    }
  };
};

// export const addToBlacklist = (token) => {
//   tokenBlacklist.add(token);
// };

// export const removeFromBlacklist = (token) => {
//   tokenBlacklist.delete(token);
// };
