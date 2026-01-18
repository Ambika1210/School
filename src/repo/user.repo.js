import { STUDENT } from '../constants/enums.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

class UserRepo {
  
  createUser = async (data) => {
    try {
      logger.info(`UserRepo >>>> createUser >>>> Creating user with email: ${data.email}, role: ${data.role}`);
      const user = await User.create(data);
      
      logger.info(`UserRepo >>>> createUser >>>> User created successfully with userId: ${user._id}, email: ${user.email}, role: ${user.role}`);
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> createUser >>>> Error creating user: ${error.message}`, {
        stack: error.stack,
        email: data?.email
      });
      throw error;
    }
  };

  getUserByEmail = async (email, instituteId = null) => {
    try {
      logger.info(`UserRepo >>>> getUserByEmail >>>> Checking email: ${email}, instituteId: ${instituteId}`);
      const query = { email, isDeleted: false };
      if (instituteId) {
        query.instituteId = instituteId;
      } else {
        // For super admin, check globally (instituteId is null)
        query.instituteId = null;
      }
      
      const user = await User.findOne(query).lean();
      
      if (user) {
        logger.info(`UserRepo >>>> getUserByEmail >>>> User found with email: ${email}, userId: ${user._id}`);
      } else {
        logger.info(`UserRepo >>>> getUserByEmail >>>> No user found with email: ${email}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> getUserByEmail >>>> Error checking user email: ${error.message}`, {
        stack: error.stack,
        email
      });
      throw error;
    }
  };

  getUserByPhone = async (phoneNo, countryCode, instituteId = null) => {
    try {
      if (!phoneNo) return null;
      
      logger.info(`UserRepo >>>> getUserByPhone >>>> Checking phone: ${phoneNo}, countryCode: ${countryCode}, instituteId: ${instituteId}`);
      const query = { phoneNo, isDeleted: false };
      
      if (countryCode) {
        query.countryCode = countryCode;
      }
      
      if (instituteId) {
        query.instituteId = instituteId;
      } else {
        // For super admin, check globally (instituteId is null)
        query.instituteId = null;
      }
      
      const user = await User.findOne(query).lean();
      
      if (user) {
        logger.info(`UserRepo >>>> getUserByPhone >>>> User found with phone: ${phoneNo}, userId: ${user._id}`);
      } else {
        logger.info(`UserRepo >>>> getUserByPhone >>>> No user found with phone: ${phoneNo}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> getUserByPhone >>>> Error checking user phone: ${error.message}`, {
        stack: error.stack,
        phoneNo
      });
      throw error;
    }
  };

  getUserByEmailForLogin = async (email) => {
    try {
      logger.info(`UserRepo >>>> getUserByEmailForLogin >>>> Finding user for login with email: ${email}`);
      // Search for user by email only (instituteId will come from user record)
      // Since email is unique at institute level, we search without instituteId filter
      const query = { email: email.toLowerCase().trim(), isDeleted: false };
      
      const user = await User.findOne(query);
      
      if (user) {
        logger.info(`UserRepo >>>> getUserByEmailForLogin >>>> User found for login with email: ${email}, userId: ${user._id}, instituteId: ${user.instituteId}`);
      } else {
        logger.info(`UserRepo >>>> getUserByEmailForLogin >>>> No user found for login with email: ${email}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> getUserByEmailForLogin >>>> Error finding user for login: ${error.message}`, {
        stack: error.stack,
        email
      });
      throw error;
    }
  };

  updateLastLogin = async (userId) => {
    try {
      logger.info(`UserRepo >>>> updateLastLogin >>>> Updating last login for userId: ${userId}`);
      const user = await User.findByIdAndUpdate(
        userId,
        { lastLogin: new Date() },
        { new: true }
      ).lean();
      
      logger.info(`UserRepo >>>> updateLastLogin >>>> Last login updated successfully`, { userId });
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> updateLastLogin >>>> Error updating last login: ${error.message}`, {
        stack: error.stack,
        userId
      });
      throw error;
    }
  };

  getUserById = async (userId) => {
    try {
      logger.info(`UserRepo >>>> getUserById >>>> Fetching user: ${userId}`);
      const user = await User.findById(userId).lean();
      
      if (user) {
        logger.info(`UserRepo >>>> getUserById >>>> User found with userId: ${userId}`);
      } else {
        logger.info(`UserRepo >>>> getUserById >>>> No user found with userId: ${userId}`);
      }
      
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> getUserById >>>> Error fetching user: ${error.message}`, {
        stack: error.stack,
        userId
      });
      throw error;
    }
  };

  getAllUsers = async (query) => {
    try {
      logger.info(`UserRepo >>>> getAllUsers >>>> Fetching users with query:`, query);
      
      const {
        instituteId,
        role,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = query;

      // Build filter object
      const filter = {};
      
      // Institute ID is mandatory - users can only see their own institute's users
      if (instituteId) {
        filter.instituteId = new mongoose.Types.ObjectId(instituteId);
      }

      // Optional filters
      if (role) {
        filter.role = role;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === true || isActive === 'true';
      }
      if (isDeleted !== undefined) {
        filter.isDeleted = isDeleted === true || isDeleted === 'true';
      } else {
        // By default, exclude deleted users
        filter.isDeleted = false;
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      // Get total count
      const total = await User.countDocuments(filter);

      // Fetch users with pagination and populate institute
      const users = await User.find(filter)
        .populate('instituteId', 'name code')
        .select('-password') // Exclude password from response
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limitNum)
        .lean();

      logger.info(`UserRepo >>>> getAllUsers >>>> Fetched ${users.length} users, total: ${total}`);
      return { users, total, page: parseInt(page), limit: limitNum };
    } catch (error) {
      logger.error('UserRepo >>>> getAllUsers >>>> Error fetching users', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  countUsers = async (filter) => {
    try {
      logger.info(`UserRepo >>>> countUsers >>>> Counting users with filter:`, filter);
      const total = await User.countDocuments(filter);
      logger.info(`UserRepo >>>> countUsers >>>> Total users: ${total}`);
      return total;
    } catch (error) {
       logger.error('UserRepo >>>> countUsers >>>> Error counting users', {
        error: error.message,
        stack: error.stack,
        filter
      });
      throw error;
    }
  };

  getUsersWithoutProfile = async (query) => {
    try {
      logger.info(`UserRepo >>>> getUsersWithoutProfile >>>> Fetching parsed users without profile with query:`, query);
      
      const {
        instituteId,
        role,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = query;

      // Build filter object - users with specified role (or any) but no profileId
      const filter = {
        profileId: null // Only users without a linked profile
      };
      
      if (role) {
        filter.role = role;
      }

      // Institute ID is mandatory
      if (instituteId) {
        filter.instituteId = new mongoose.Types.ObjectId(instituteId);
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === true || isActive === 'true';
      }
      if (isDeleted !== undefined) {
        filter.isDeleted = isDeleted === true || isDeleted === 'true';
      } else {
        filter.isDeleted = false;
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      // Get total count
      const total = await User.countDocuments(filter);

      // Fetch users with pagination
      const users = await User.find(filter)
        .populate('instituteId', 'name code')
        .select('-password')
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limitNum)
        .lean();

      logger.info(`UserRepo >>>> getUsersWithoutProfile >>>> Fetched ${users.length} users, total: ${total}`);
      return { users, total, page: parseInt(page), limit: limitNum };
    } catch (error) {
      logger.error('UserRepo >>>> getUsersWithoutProfile >>>> Error fetching users without profile', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  updateUserProfileId = async (userId, profileId) => {
    try {
      logger.info(`UserRepo >>>> updateUserProfileId >>>> Updating profileId for userId: ${userId} to ${profileId}`);
      const user = await User.findByIdAndUpdate(
        userId,
        { profileId },
        { new: true }
      ).lean();
      
      if (!user) {
        logger.error(`UserRepo >>>> updateUserProfileId >>>> User not found for userId: ${userId}`, { userId });
        return null;
      }
      
      logger.info(`UserRepo >>>> updateUserProfileId >>>> User profileId updated successfully`, { userId, profileId });
      return user;
    } catch (error) {
      logger.error(`UserRepo >>>> updateUserProfileId >>>> Error updating user profileId: ${error.message}`, {
        stack: error.stack,
        userId
      });
      throw error;
    }
  };

}

export default new UserRepo();

