import userRepo from '../repo/user.repo.js';
import instituteRepo from '../repo/institute.repo.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.middleware.js';
import serverConfig from '../config/config.js';
import { SUPER_ADMIN, INSTITUTE_ADMIN, TEACHER, STUDENT, PARENT, STAFF, USER } from '../constants/enums.js';

class UserService {
  
  hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };
  
  createSuperAdmin = async (userData) => {
    try {
      logger.info(`UserService >>>> createSuperAdmin >>>> Processing super admin creation for email: ${userData.email}`);
      
      // Validate required fields
      const { firstName, lastName, email, password } = userData;
      if (!firstName || !lastName || !email || !password) {
        throw new Error('Missing required fields: firstName, lastName, email, and password are mandatory.');
      }

      // Super admin should not have instituteId
      if (userData.instituteId) {
        throw new Error('Super admin cannot be associated with an institute');
      }

      // Check if user already exists by email
      const existingUserByEmail = await userRepo.getUserByEmail(email, null);
      if (existingUserByEmail) {
        logger.error(`UserService >>>> createSuperAdmin >>>> User already exists with email: ${email}`);
        throw new Error('User with this email already exists');
      }

      // Check if user already exists by phone
      if (userData.phoneNo) {
        const existingUserByPhone = await userRepo.getUserByPhone(userData.phoneNo, userData.countryCode, null);
        if (existingUserByPhone) {
          logger.error(`UserService >>>> createSuperAdmin >>>> User already exists with phone: ${userData.phoneNo}`);
          throw new Error('User with this phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);
      
      // Prepare user data
      const dataToCreate = {
        ...userData,
        password: hashedPassword,
        role: SUPER_ADMIN,
        instituteId: null
      };

      const user = await userRepo.createUser(dataToCreate);
      
      // Remove password from response
      const userResponse = user.toObject ? user.toObject() : user;
      delete userResponse.password;
      
      logger.info(`UserService >>>> createSuperAdmin >>>> Super admin created successfully with userId: ${user._id}, email: ${user.email}`);
      return userResponse;
    } catch (error) {
      logger.error(`UserService >>>> createSuperAdmin >>>> Error creating super admin: ${error.message}`, {
        stack: error.stack,
        email: userData?.email
      });
      throw error;
    }
  };

  createInstituteAdmin = async (userData, instituteId) => {
    try {
      logger.info(`UserService >>>> createInstituteAdmin >>>> Processing institute admin creation for email: ${userData.email}, instituteId: ${instituteId}`);
      
      // Validate required fields
      const { firstName, lastName, email, password } = userData;
      if (!firstName || !lastName || !email || !password) {
        throw new Error('Missing required fields: firstName, lastName, email, and password are mandatory.');
      }

      if (!instituteId) {
        throw new Error('Institute ID is required for institute admin');
      }

      // Check if institute exists and is active
      const institute = await instituteRepo.getInstituteById(instituteId);
      if (!institute) {
        logger.error(`UserService >>>> createInstituteAdmin >>>> Institute not found for instituteId: ${instituteId}`);
        throw new Error('Institute not found');
      }

      if (institute.isDeleted) {
        logger.error(`UserService >>>> createInstituteAdmin >>>> Institute is deleted for instituteId: ${instituteId}`);
        throw new Error('Institute has been deleted');
      }

      if (!institute.isActive) {
        logger.error(`UserService >>>> createInstituteAdmin >>>> Institute is not active for instituteId: ${instituteId}`);
        throw new Error('Institute is not active');
      }

      // Check if user already exists by email
      const existingUserByEmail = await userRepo.getUserByEmail(email, instituteId);
      if (existingUserByEmail) {
        logger.error(`UserService >>>> createInstituteAdmin >>>> User already exists with email: ${email}, instituteId: ${instituteId}`);
        throw new Error('User with this email already exists in this institute');
      }

      // Check if user already exists by phone
      if (userData.phoneNo) {
        const existingUserByPhone = await userRepo.getUserByPhone(userData.phoneNo, userData.countryCode, instituteId);
        if (existingUserByPhone) {
          logger.error(`UserService >>>> createInstituteAdmin >>>> User already exists with phone: ${userData.phoneNo}, instituteId: ${instituteId}`);
          throw new Error('User with this phone number already exists in this institute');
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);
      
      // Prepare user data
      const dataToCreate = {
        ...userData,
        password: hashedPassword,
        role: INSTITUTE_ADMIN,
        instituteId
      };

      const user = await userRepo.createUser(dataToCreate);
      
      // Remove password from response
      const userResponse = user.toObject ? user.toObject() : user;
      delete userResponse.password;
      
      logger.info(`UserService >>>> createInstituteAdmin >>>> Institute admin created successfully with userId: ${user._id}, email: ${user.email}, instituteId: ${instituteId}`);
      return userResponse;
    } catch (error) {
      logger.error(`UserService >>>> createInstituteAdmin >>>> Error creating institute admin: ${error.message}`, {
        stack: error.stack,
        email: userData?.email,
        instituteId
      });
      throw error;
    }
  };

  createInstituteUser = async (userData, role, instituteId) => {
    try {
      logger.info(`UserService >>>> createInstituteUser >>>> Processing institute user creation for email: ${userData.email}, role: ${role}, instituteId: ${instituteId}`);
      
      const { email, password } = userData;

      // Check if institute exists and is active
      const institute = await instituteRepo.getInstituteById(instituteId);
      if (!institute) {
        logger.error(`UserService >>>> createInstituteUser >>>> Institute not found for instituteId: ${instituteId}`);
        throw new Error('Institute not found');
      }

      if (institute.isDeleted) {
        logger.error(`UserService >>>> createInstituteUser >>>> Institute is deleted for instituteId: ${instituteId}`);
        throw new Error('Institute has been deleted');
      }

      if (!institute.isActive) {
        logger.error(`UserService >>>> createInstituteUser >>>> Institute is not active for instituteId: ${instituteId}`);
        throw new Error('Institute is not active');
      }

      // Check if user already exists by email
      const existingUserByEmail = await userRepo.getUserByEmail(email, instituteId);
      if (existingUserByEmail) {
        logger.error(`UserService >>>> createInstituteUser >>>> User already exists with email: ${email}, instituteId: ${instituteId}`);
        throw new Error('User with this email already exists in this institute');
      }

      // Check if user already exists by phone
      if (userData.phoneNo) {
        const existingUserByPhone = await userRepo.getUserByPhone(userData.phoneNo, userData.countryCode, instituteId);
        if (existingUserByPhone) {
          logger.error(`UserService >>>> createInstituteUser >>>> User already exists with phone: ${userData.phoneNo}, instituteId: ${instituteId}`);
          throw new Error('User with this phone number already exists in this institute');
        }
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);
      
      // Prepare user data
      const dataToCreate = {
        ...userData,
        password: hashedPassword,
        role,
        instituteId
      };

      const user = await userRepo.createUser(dataToCreate);
      
      // Remove password from response
      const userResponse = user.toObject ? user.toObject() : user;
      delete userResponse.password;
      
      logger.info(`UserService >>>> createInstituteUser >>>> Institute user created successfully with userId: ${user._id}, email: ${user.email}, role: ${role}, instituteId: ${instituteId}`);
      return userResponse;
    } catch (error) {
      logger.error(`UserService >>>> createInstituteUser >>>> Error creating institute user: ${error.message}`, {
        stack: error.stack,
        email: userData?.email,
        role,
        instituteId
      });
      throw error;
    }
  };

  login = async (email, password) => {
    try {
      logger.info(`UserService >>>> login >>>> Processing login for email: ${email}`);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email (instituteId will come from user record)
      const user = await userRepo.getUserByEmailForLogin(email);
      
      if (!user) {
        logger.error(`UserService >>>> login >>>> User not found for email: ${email}`);
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        logger.error(`UserService >>>> login >>>> User account is inactive for email: ${email}`);
        throw new Error('User account is inactive');
      }

      // Check if user is deleted
      if (user.isDeleted) {
        logger.error(`UserService >>>> login >>>> User account is deleted for email: ${email}`);
        throw new Error('User account has been deleted');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.error(`UserService >>>> login >>>> Invalid password for email: ${email}`);
        throw new Error('Invalid email or password');
      }

      // For institute users, verify institute is active
      if (user.instituteId) {
        const institute = await instituteRepo.getInstituteById(user.instituteId);
        if (!institute) {
          logger.error(`UserService >>>> login >>>> Institute not found for userId: ${user._id}`);
          throw new Error('Institute not found');
        }
        if (institute.isDeleted) {
          logger.error(`UserService >>>> login >>>> Institute is deleted for userId: ${user._id}`);
          throw new Error('Institute has been deleted');
        }
        if (!institute.isActive) {
          logger.error(`UserService >>>> login >>>> Institute is not active for userId: ${user._id}`);
          throw new Error('Institute is not active');
        }
      }

      // Update last login
      await userRepo.updateLastLogin(user._id);

      // Generate JWT token
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        instituteId: user.instituteId?.toString() || null
      };

      const token = generateToken(tokenPayload);

      // Remove password from user object
      const userResponse = user.toObject ? user.toObject() : user;
      delete userResponse.password;

      logger.info(`UserService >>>> login >>>> Login successful for userId: ${user._id}, email: ${user.email}`);
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      logger.error(`UserService >>>> login >>>> Error during login: ${error.message}`, {
        stack: error.stack,
        email
      });
      throw error;
    }
  };

  getAllUsers = async (query) => {
    try {
      logger.info(`UserService >>>> getAllUsers >>>> Fetching all users for institute: ${query.instituteId}`);
      
      // Institute ID is mandatory - users can only see their own institute's users
      if (!query.instituteId) {
        throw new Error('Institute ID is required to fetch users.');
      }

      const { users, total, page, limit } = await userRepo.getAllUsers(query);
      
      logger.info(`UserService >>>> getAllUsers >>>> Fetched ${users.length} users, total: ${total}`);
      return { users, total, page, limit };
    } catch (error) {
      logger.error('UserService >>>> getAllUsers >>>> Error fetching all users', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  getUsersWithoutProfile = async (query) => {
    try {
      logger.info(`UserService >>>> getUsersWithoutProfile >>>> Fetching parsed users without profile for institute: ${query.instituteId}`);
      
      // Institute ID is mandatory
      if (!query.instituteId) {
        throw new Error('Institute ID is required to fetch users without profile.');
      }

      const { users, total, page, limit } = await userRepo.getUsersWithoutProfile(query);
      
      logger.info(`UserService >>>> getUsersWithoutProfile >>>> Fetched ${users.length} users, total: ${total}`);
      return { users, total, page, limit };
    } catch (error) {
      logger.error('UserService >>>> getUsersWithoutProfile >>>> Error fetching users without profile', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };
}

export default new UserService();

