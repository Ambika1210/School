import instituteService from '../services/institute.service.js';
import logger from '../utils/logger.js';
import { 
  setCreateSuccess, 
  setSuccess, 
  setNotFoundError, 
  setServerError 
} from '../utils/responseHelper.js';

class InstituteController {
  
  instituteCreate = async (req, res) => {
    try {
      const { name, code, address, contactEmail, contactPhone } = req.body.institute || {};

      if (!name || !code || !address || !contactEmail || !contactPhone) {
        logger.error('InstituteController >>>> instituteCreate >>>> Missing required fields', {
          missingFields: {
            name: !name,
            code: !code,
            address: !address,
            contactEmail: !contactEmail,
            contactPhone: !contactPhone
          }
        });
        return setServerError(res, { message: 'Missing required fields: name, code, address, contactEmail, contactPhone are mandatory.' });
      }

      logger.info(`InstituteController >>>> instituteCreate >>>> Creating institute with code: ${code}`);
      const institute = await instituteService.instituteCreate(req.body.institute);
      
      logger.info(`InstituteController >>>> instituteCreate >>>> Institute created successfully`, { instituteId: institute._id, code: institute.code });
      setCreateSuccess(res, {message: 'Institute created successfully',institute});
    } catch (error) {
      logger.error('InstituteController >>>> instituteCreate >>>> Error creating institute', {
        error: error.message,
        stack: error.stack,
        code: req.body.institute?.code
      });
      setServerError(res, { message: error.message });
    }
  };

  instituteGet = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`InstituteController >>>> instituteGet >>>> Fetching institute details for ID: ${id}`);
      const institute = await instituteService.instituteGet(id);
      
      if (!institute) {
        logger.error(`InstituteController >>>> instituteGet >>>> Institute not found`, { instituteId: id });
        return setNotFoundError(res, { message: 'Institute not found' });
      }
      
      logger.info(`InstituteController >>>> instituteGet >>>> Institute fetched successfully`, { instituteId: id, code: institute.code });
      setSuccess(res, {message: 'Institute fetched successfully',institute});
    } catch (error) {
      logger.error('InstituteController >>>> instituteGet >>>> Error fetching institute', {
        error: error.message,
        stack: error.stack,
        instituteId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  instituteUpdate = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`InstituteController >>>> instituteUpdate >>>> Updating institute for ID: ${id}`);
      const institute = await instituteService.instituteUpdate(id, req.body);
      
      logger.info(`InstituteController >>>> instituteUpdate >>>> Institute updated successfully`, { instituteId: id, code: institute?.code });
        setSuccess(res, {message: 'Institute updated successfully',institute});
    } catch (error) {
      logger.error('InstituteController >>>> instituteUpdate >>>> Error updating institute', {
        error: error.message,
        stack: error.stack,
        instituteId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  instituteDelete = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`InstituteController >>>> instituteDelete >>>> Deleting institute for ID: ${id}`);
      const result = await instituteService.instituteDelete(id);
      
      logger.info(`InstituteController >>>> instituteDelete >>>> Institute deleted successfully`, { instituteId: id });
      setSuccess(res, { message: 'Institute deleted successfully',result });
    } catch (error) {
      logger.error('InstituteController >>>> instituteDelete >>>> Error deleting institute', {
        error: error.message,
        stack: error.stack,
        instituteId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  allInstitute = async (req, res) => {
    try {
      logger.info('InstituteController >>>> allInstitute >>>> Fetching all institutes');
      const result = await instituteService.allInstitute(req.query);
      
      logger.info(`InstituteController >>>> allInstitute >>>> Institutes fetched successfully`, { 
        count: result?.institutes?.length || result?.length || 0,
        total: result?.total || result?.length || 0
      });
      setSuccess(res, { result, message: 'Institutes fetched successfully' });
    } catch (error) {
      logger.error('InstituteController >>>> allInstitute >>>> Error fetching institutes', {
        error: error.message,
        stack: error.stack,
        query: req.query
      });
      setServerError(res, { message: error.message });
    }
  };
  getInstituteAdmins = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`InstituteController >>>> getInstituteAdmins >>>> Fetching admins for institute ID: ${id}`);
      const result = await instituteService.getInstituteAdmins(id, req.query);
      
      logger.info(`InstituteController >>>> getInstituteAdmins >>>> Admins fetched successfully`, { 
        instituteId: id,
        count: result?.users?.length || 0 
      });
      setSuccess(res, { result, message: 'Institute admins fetched successfully' });
    } catch (error) {
      logger.error('InstituteController >>>> getInstituteAdmins >>>> Error fetching institute admins', {
        error: error.message,
        stack: error.stack,
        instituteId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };
}

export default new InstituteController();
