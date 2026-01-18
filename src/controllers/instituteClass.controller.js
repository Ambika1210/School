import instituteClassService from '../services/instituteClass.service.js';
import logger from '../utils/logger.js';
import { getInstituteId } from '../middleware/contextStore.js';
import { 
  setCreateSuccess, 
  setSuccess, 
  setNotFoundError, 
  setServerError,
  setBadRequest,
  setConflictError
} from '../utils/responseHelper.js';

class InstituteClassController {

  createClass = async (req, res) => {
    try {
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error(`InstituteClassController >>>> createClass >>>> Missing institute ID`);
        return setBadRequest(res, { message: 'Institute ID is required.' });
      }

      // Ensure academicSessionId is provided or derived? 
      // Assuming frontend sends it.
      const classData = { ...req.body, instituteId };

      if (!classData.name || !classData.section || !classData.academicSessionId) {
         logger.error(`InstituteClassController >>>> createClass >>>> Missing required fields`);
         return setBadRequest(res, { message: 'Name, Section and Academic Session are required.' });
      }

      logger.info(`InstituteClassController >>>> createClass >>>> Creating class: ${classData.name} ${classData.section}`);
      
      const result = await instituteClassService.createClass(classData);
      
      logger.info(`InstituteClassController >>>> createClass >>>> Class created: ${result._id}`);
      setCreateSuccess(res, { message: 'Class created successfully', class: result });

    } catch (error) {
       if (error.message.includes('already exists')) {
          logger.error(`InstituteClassController >>>> createClass >>>> Conflict: ${error.message}`);
          return setConflictError(res, { message: error.message });
       }

      logger.error('InstituteClassController >>>> createClass >>>> Error', error);
      setServerError(res, { message: error.message });
    }
  };

  getAllClasses = async (req, res) => {
    try {
      const instituteId = getInstituteId();
      
      if (!instituteId) {
          logger.error(`InstituteClassController >>>> getAllClasses >>>> Missing institute ID`);
          return setBadRequest(res, { message: 'Institute ID is required.' });
      }

      const { page, limit, academicSessionId } = req.query;

      const filter = { instituteId };
      if (academicSessionId) filter.academicSessionId = academicSessionId;

      const pagination = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };

      logger.info(`InstituteClassController >>>> getAllClasses >>>> Fetching classes for institute: ${instituteId}`);
      
      const result = await instituteClassService.getAllClasses(filter, pagination);
      
      setSuccess(res, { message: 'Classes fetched successfully', ...result });

    } catch (error) {
      logger.error('InstituteClassController >>>> getAllClasses >>>> Error', error);
      setServerError(res, { message: error.message });
    }
  };

  getClassById = async (req, res) => {
    try {
      const { id } = req.params;
      
      logger.info(`InstituteClassController >>>> getClassById >>>> Fetching class: ${id}`);
      
      const result = await instituteClassService.getClassById(id);
      
      setSuccess(res, { message: 'Class fetched successfully', class: result });

    } catch (error) {
      if (error.message === 'Class not found') {
          return setNotFoundError(res, { message: error.message });
      }
      logger.error('InstituteClassController >>>> getClassById >>>> Error', error);
      setServerError(res, { message: error.message });
    }
  };

  updateClass = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      

      logger.info(`InstituteClassController >>>> updateClass >>>> Updating class: ${id}`);

      const result = await instituteClassService.updateClass(id, updateData);
      
      setSuccess(res, { message: 'Class updated successfully', class: result });

    } catch (error) {
       if (error.message === 'Class not found') {
          return setNotFoundError(res, { message: error.message });
       }
       if (error.message.includes('already exists')) {
          return setConflictError(res, { message: error.message });
       }

      logger.error('InstituteClassController >>>> updateClass >>>> Error', error);
      setServerError(res, { message: error.message });
    }
  };

  deleteClass = async (req, res) => {
    try {
      const { id } = req.params;
      
      logger.info(`InstituteClassController >>>> deleteClass >>>> Deleting class: ${id}`);

      const result = await instituteClassService.deleteClass(id);
      
      setSuccess(res, { message: 'Class deleted successfully', class: result });
    } catch (error) {
      if (error.message === 'Class not found') {
          return setNotFoundError(res, { message: error.message });
      }
      logger.error('InstituteClassController >>>> deleteClass >>>> Error', error);
      setServerError(res, { message: error.message });
    }
  };

}

export default new InstituteClassController();
