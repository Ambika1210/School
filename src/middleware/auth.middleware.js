import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import mongoose from 'mongoose';
import serverConfig from '../config/config.js';
import { setNotAuthorized, setForbidden, setNotFoundError } from '../utils/responseHelper.js';
import { hasPermission } from './permission.js';
import { SUPER_ADMIN } from '../constants/enums.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import { setAuthContext } from './contextStore.js';

// Cache decoded JWTs for 1 minute
const tokenCache = new NodeCache({ stdTTL: 60 });

function verifyToken(token) {
  const cached = tokenCache.get(token);
  if (cached) return cached;
  const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
  tokenCache.set(token, decoded);
  return decoded;
}

function generateToken(payload) {
  try {
    logger.info(`generateToken >>>> Generating token for userId: ${payload.userId}`);
    const token = jwt.sign(payload, serverConfig.JWT_SECRET, {
      expiresIn: serverConfig.JWT_EXPIRES_IN
    });
    logger.info(`generateToken >>>> Token generated successfully for userId: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error(`generateToken >>>> Error generating token: ${error.message}`, {
      stack: error.stack,
      userId: payload?.userId
    });
    throw error;
  }
}

// Fetch user by ID and validate existence
async function fetchUserById(userId) {
  const existingUser = await User
    .findById(userId)
    .lean();

  if (!existingUser) {
    throw new Error('User not found');
  }

  if (existingUser.isDeleted) {
    throw new Error('User deleted');
  }

  if (!existingUser.isActive) {
    throw new Error('User inactive');
  }
  
  // Institute validation can be added here if needed (e.g., check if institute is active)

  return existingUser;
}

function checkPermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return setNotAuthorized(res, { message: 'No token provided' });
      }

      const payload = verifyToken(token);
      const { userId } = payload;

      if (!userId) {
        return setNotAuthorized(res, { message: 'Invalid token payload' });
      }

      try {
        const contextUserId = userId ? new mongoose.Types.ObjectId(userId) : null;
        const existingUser = await fetchUserById(contextUserId);

        if (requiredPermission && !hasPermission(existingUser.role, requiredPermission)) {
           logger.warn(`checkPermission >>>> Access Denied for User: ${userId} | Role: ${existingUser.role} | Required: ${requiredPermission}`);
           return setForbidden(res, { message: 'Insufficient permissions' });
        }

        // Enrich request context using separate helper
        setAuthContext(req, { ...payload, ...existingUser });

        next();
      } catch (err) {
        if (err.message === 'User not found') return setNotFoundError(res, { message: 'User not found' });
        if (err.message === 'User deleted') return setNotFoundError(res, { message: 'User has been deleted' });
        if (err.message === 'User inactive') return setForbidden(res, { message: 'User account is inactive' });
        throw err;
      }
    } catch (err) {
      logger.error(`checkPermission Error: ${err.message}`);
      return setNotAuthorized(res, { message: 'Session expired. Please login again' || 'Authentication failed' });
    }
  };
}

const protectRoutes = {
  checkPermission,
};

export { checkPermission, generateToken };
export default protectRoutes;
