import userService from '../services/user.service.js';
import logger from '../utils/logger.js';
import { TEACHER, STUDENT, PARENT, STAFF, USER } from '../constants/enums.js';
import { getInstituteId } from '../middleware/contextStore.js';
import { 
  setCreateSuccess, 
  setServerError,
  setBadRequest,
  setSuccess
} from '../utils/responseHelper.js';

class UserController {
  
  createSuperAdmin = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNo, countryCode, gender, dob, address } = req.body.user || {};

      if (!firstName || !lastName || !email || !password) {
        logger.error(`UserController >>>> createSuperAdmin >>>> Missing required fields - firstName: ${!firstName}, lastName: ${!lastName}, email: ${!email}, password: ${!password}`);
        return setBadRequest(res, { message: 'Missing required fields: firstName, lastName, email, and password are mandatory.' });
      }

      logger.info(`UserController >>>> createSuperAdmin >>>> Creating super admin with email: ${email}`);
      const user = await userService.createSuperAdmin({
        firstName,
        lastName,
        email,
        password,
        phoneNo,
        countryCode,
        gender,
        dob,
        address
      });
      
      logger.info(`UserController >>>> createSuperAdmin >>>> Super admin created successfully with userId: ${user._id}, email: ${user.email}`);
      setCreateSuccess(res, {message: 'Super admin created successfully',user});
    } catch (error) {
      logger.error(`UserController >>>> createSuperAdmin >>>> Error creating super admin: ${error.message}`, {
        stack: error.stack,
        email: req.body.user?.email
      });
      setServerError(res, { message: error.message });
    }
  };

  createInstituteAdmin = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNo, countryCode, gender, dob, address } = req.body.user || {};
      const instituteId = getInstituteId() || req.body.instituteId;

      if (!firstName || !lastName || !email || !password) {
        logger.error(`UserController >>>> createInstituteAdmin >>>> Missing required fields - firstName: ${!firstName}, lastName: ${!lastName}, email: ${!email}, password: ${!password}`);
        return setBadRequest(res, { message: 'Missing required fields: firstName, lastName, email, and password are mandatory.' });
      }

      if (!instituteId) {
        logger.error(`UserController >>>> createInstituteAdmin >>>> Missing institute ID`);
        return setBadRequest(res, { message: 'Institute ID is required for institute admin creation.' });
      }

      logger.info(`UserController >>>> createInstituteAdmin >>>> Creating institute admin with email: ${email}, instituteId: ${instituteId}`);
      const user = await userService.createInstituteAdmin({
        firstName,
        lastName,
        email,
        password,
        phoneNo,
        countryCode,
        gender,
        dob,
        address
      }, instituteId);
      
      logger.info(`UserController >>>> createInstituteAdmin >>>> Institute admin created successfully with userId: ${user._id}, email: ${user.email}, instituteId: ${instituteId}`);
      setCreateSuccess(res, {message: 'Institute admin created successfully',user});
    } catch (error) {
      logger.error(`UserController >>>> createInstituteAdmin >>>> Error creating institute admin: ${error.message}`, {
        stack: error.stack,
        email: req.body.user?.email
      });
      setServerError(res, { message: error.message });
    }
  };

  createInstituteUser = async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNo, countryCode, gender, dob, address, role } = req.body.user || {};
      const instituteId = getInstituteId() || req.body.instituteId;

      if (!firstName || !lastName || !email || !password) {
        logger.error(`UserController >>>> createInstituteUser >>>> Missing required fields - firstName: ${!firstName}, lastName: ${!lastName}, email: ${!email}, password: ${!password}`);
        return setBadRequest(res, { message: 'Missing required fields: firstName, lastName, email, and password are mandatory.' });
      }

      if (!role) {
        logger.error(`UserController >>>> createInstituteUser >>>> Missing role`);
        return setBadRequest(res, { message: 'Role is required. Allowed roles: TEACHER, STUDENT, PARENT, STAFF, USER' });
      }

      const allowedRoles = [TEACHER, STUDENT, PARENT, STAFF, USER];
      if (!allowedRoles.includes(role)) {
        logger.error(`UserController >>>> createInstituteUser >>>> Invalid role: ${role}`);
        return setBadRequest(res, { message: `Invalid role. Allowed roles are: ${allowedRoles.join(', ')}` });
      }

      if (!instituteId) {
        logger.error(`UserController >>>> createInstituteUser >>>> Missing institute ID`);
        return setBadRequest(res, { message: 'Institute ID is required for institute user creation.' });
      }

      logger.info(`UserController >>>> createInstituteUser >>>> Creating institute user with email: ${email}, role: ${role}, instituteId: ${instituteId}`);
      const user = await userService.createInstituteUser({
        firstName,
        lastName,
        email,
        password,
        phoneNo,
        countryCode,
        gender,
        dob,
        address
      }, role, instituteId);
      
      logger.info(`UserController >>>> createInstituteUser >>>> Institute user created successfully with userId: ${user._id}, email: ${user.email}, role: ${role}, instituteId: ${instituteId}`);
      setCreateSuccess(res, {message: `${role} created successfully`, user});
    } catch (error) {
      logger.error(`UserController >>>> createInstituteUser >>>> Error creating institute user: ${error.message}`, {
        stack: error.stack,
        email: req.body.user?.email,
        role: req.body.user?.role
      });
      setServerError(res, { message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        logger.error(`UserController >>>> login >>>> Missing required fields - email: ${!email}, password: ${!password}`);
        return setBadRequest(res, { message: 'Email and password are required' });
      }

      logger.info(`UserController >>>> login >>>> Processing login for email: ${email}`);
      const result = await userService.login(email, password);
      
      logger.info(`UserController >>>> login >>>> Login successful for userId: ${result.user._id}, email: ${result.user.email}`);
      setSuccess(res, { 
        message: 'Login successful' ,
        user: result.user, 
        token: result.token,

      });
    } catch (error) {
      logger.error(`UserController >>>> login >>>> Error during login: ${error.message}`, {
        stack: error.stack,
        email: req.body?.email
      });
      setServerError(res, { message: error.message });
    }
  };

  getAllUsers = async (req, res) => {
    try {
      // Get instituteId from context store (mandatory for security)
      // Users can only see users from their own institute
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error('UserController >>>> getAllUsers >>>> Missing institute ID in token');
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      // Get query parameters
      const {
        role, // Filter by role: TEACHER, PARENT, STAFF, USER, etc.
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = req.query;

      logger.info(`UserController >>>> getAllUsers >>>> Fetching users for institute: ${instituteId}`, {
        filters: { role, isActive, isDeleted, page, limit }
      });

      const { users, total, page: currentPage, limit: currentLimit } = await userService.getAllUsers({
        instituteId, // Mandatory - from JWT token
        role,
        isActive,
        isDeleted,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      logger.info(`UserController >>>> getAllUsers >>>> Fetched ${users.length} users, total: ${total}`);
      
      setSuccess(res, {
        message: 'Users fetched successfully',
        users,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        }
      });
    } catch (error) {
      logger.error('UserController >>>> getAllUsers >>>> Error fetching users', {
        error: error.message,
        stack: error.stack,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };

  getUsersWithoutProfile = async (req, res) => {
    try {
      // Get instituteId from context store (mandatory for security)
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error('UserController >>>> getUsersWithoutProfile >>>> Missing institute ID in token');
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      // Get query parameters
      const {
        role,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = req.query;

      logger.info(`UserController >>>> getUsersWithoutProfile >>>> Fetching users without profile for institute: ${instituteId}`, {
        filters: { role, isActive, isDeleted, page, limit }
      });

      const { users, total, page: currentPage, limit: currentLimit } = await userService.getUsersWithoutProfile({
        instituteId, // Mandatory - from JWT token
        role,
        isActive,
        isDeleted,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      logger.info(`UserController >>>> getUsersWithoutProfile >>>> Fetched ${users.length} users, total: ${total}`);
      
      setSuccess(res, {
        message: 'Users without profile fetched successfully',
        users,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        }
      });
    } catch (error) {
      logger.error('UserController >>>> getUsersWithoutProfile >>>> Error fetching users without profile', {
        error: error.message,
        stack: error.stack,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };
}

export default new UserController();

