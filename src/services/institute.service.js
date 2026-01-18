import instituteRepo from '../repo/institute.repo.js';
import userRepo from '../repo/user.repo.js';
import { INSTITUTE_ADMIN } from '../constants/enums.js';
import logger from '../utils/logger.js';

class InstituteService {
  
  instituteCreate = async (data) => {
    try {
      logger.info(`InstituteService >>>> instituteCreate >>>> Processing creation for code: ${data.code}`, { code: data.code, name: data.name });
      
      const existing = await instituteRepo.getInstituteByCode(data.code);
      
      if (existing) {
        logger.error('InstituteService >>>> instituteCreate >>>> Institute code already exists', { code: data.code, existingId: existing._id });
        throw new Error('Institute code already exists');
      }
      
      const institute = await instituteRepo.createInstitute(data);
      logger.info(`InstituteService >>>> instituteCreate >>>> Institute created successfully`, { instituteId: institute._id, code: institute.code });
      return institute;
    } catch (error) {
      logger.error('InstituteService >>>> instituteCreate >>>> Error creating institute', {
        error: error.message,
        stack: error.stack,
        code: data?.code
      });
      throw error;
    }
  };

  instituteGet = async (id) => {
    try {
      logger.info(`InstituteService >>>> instituteGet >>>> Request for ID: ${id}`);
      const institute = await instituteRepo.getInstituteById(id);
      
      if (!institute) {
        logger.error('InstituteService >>>> instituteGet >>>> Institute not found', { instituteId: id });
      } else {
        logger.info(`InstituteService >>>> instituteGet >>>> Institute fetched successfully`, { instituteId: id, code: institute.code });
      }
      
      return institute;
    } catch (error) {
      logger.error('InstituteService >>>> instituteGet >>>> Error fetching institute', {
        error: error.message,
        stack: error.stack,
        instituteId: id
      });
      throw error;
    }
  };

  instituteUpdate = async (id, data) => {
    try {
      logger.info(`InstituteService >>>> instituteUpdate >>>> Request update for ID: ${id}`);
      const institute = await instituteRepo.updateInstitute(id, data);
      
      logger.info(`InstituteService >>>> instituteUpdate >>>> Institute updated successfully`, { instituteId: id, code: institute?.code });
      return institute;
    } catch (error) {
      logger.error('InstituteService >>>> instituteUpdate >>>> Error updating institute', {
        error: error.message,
        stack: error.stack,
        instituteId: id
      });
      throw error;
    }
  };

  instituteDelete = async (id) => {
    try {
      logger.info(`InstituteService >>>> instituteDelete >>>> Request delete for ID: ${id}`);
      const result = await instituteRepo.deleteInstitute(id);
      
      logger.info(`InstituteService >>>> instituteDelete >>>> Institute deleted successfully`, { instituteId: id });
      return result;
    } catch (error) {
      logger.error('InstituteService >>>> instituteDelete >>>> Error deleting institute', {
        error: error.message,
        stack: error.stack,
        instituteId: id
      });
      throw error;
    }
  };

  allInstitute = async (query) => {
    try {
      logger.info(`InstituteService >>>> allInstitute >>>> Requesting list`);
      const result = await instituteRepo.getAllInstitutes(query);
      
      logger.info(`InstituteService >>>> allInstitute >>>> Institutes fetched successfully`, {
        count: result?.institutes?.length || result?.length || 0,
        total: result?.total || result?.length || 0
      });
      return result;
    } catch (error) {
      logger.error('InstituteService >>>> allInstitute >>>> Error fetching institutes', {
        error: error.message,
        stack: error.stack,
        query: query
      });
      throw error;
    }
  };

  getInstituteAdmins = async (instituteId, query) => {
    try {
      logger.info(`InstituteService >>>> getInstituteAdmins >>>> Fetching admins for institute: ${instituteId}`);
      
      const filter = {
        ...query,
        instituteId,
        role: INSTITUTE_ADMIN
      };

      // Run both queries in parallel
      const [result, totalInstituteUsers] = await Promise.all([
        userRepo.getAllUsers(filter),
        userRepo.countUsers({ instituteId, isDeleted: false })
      ]);
      
      logger.info(`InstituteService >>>> getInstituteAdmins >>>> Admins fetched successfully`, {
        instituteId,
        adminCount: result?.users?.length || 0,
        totalInstituteUsers
      });
      return { result, totalInstituteUsers };
    } catch (error) {
       logger.error('InstituteService >>>> getInstituteAdmins >>>> Error fetching institute admins', {
        error: error.message,
        stack: error.stack,
        instituteId
      });
      throw error;
    }
  };
}

export default new InstituteService();
