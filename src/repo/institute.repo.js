import Institute from '../models/institute.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

class InstituteRepo {
  
  createInstitute = async (data) => {
    try {
      logger.info(`InstituteRepo >>>> createInstitute >>>> Creating institute with code: ${data.code}`);
      const institute = await Institute.create(data);
      
      logger.info(`InstituteRepo >>>> createInstitute >>>> Institute created successfully`, { instituteId: institute._id, code: institute.code });
      return institute;
    } catch (error) {
      logger.error('InstituteRepo >>>> createInstitute >>>> Error creating institute', {
        error: error.message,
        stack: error.stack,
        code: data?.code
      });
      throw error;
    }
  };

  getInstituteById = async (id) => {
    try {
      logger.info(`InstituteRepo >>>> getInstituteById >>>> Fetching institute: ${id}`);
      
      const instituteId = new mongoose.Types.ObjectId(id);
      
      const institute = await Institute.findById(instituteId).lean();
      
      if (!institute) {
        logger.error('InstituteRepo >>>> getInstituteById >>>> Institute not found', { instituteId: id });
        return null;
      }
      
      logger.info(`InstituteRepo >>>> getInstituteById >>>> Institute fetched successfully`, { instituteId: id, code: institute.code });
      return institute;
    } catch (error) {
      logger.error('InstituteRepo >>>> getInstituteById >>>> Error fetching institute', {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        instituteId: id
      });
      throw error;
    }
  };

  getInstituteByCode = async (code) => {
    try {
      logger.info(`InstituteRepo >>>> getInstituteByCode >>>> Checking code: ${code}`);
      const institute = await Institute.findOne({ code, isDeleted: false });
      return institute;
    } catch (error) {
      logger.error('InstituteRepo >>>> getInstituteByCode >>>> Error checking institute code', {
        error: error.message,
        stack: error.stack,
        code
      });
      throw error;
    }
  };

  updateInstitute = async (id, data) => {
    try {
      logger.info(`InstituteRepo >>>> updateInstitute >>>> Updating institute: ${id}`);
      const institute = await Institute.findByIdAndUpdate(id, data, { new: true });
      
      if (!institute) {
        logger.error('InstituteRepo >>>> updateInstitute >>>> Institute not found for update', { instituteId: id });
      } else {
        logger.info(`InstituteRepo >>>> updateInstitute >>>> Institute updated successfully`, { instituteId: id, code: institute.code });
      }
      
      return institute;
    } catch (error) {
      logger.error('InstituteRepo >>>> updateInstitute >>>> Error updating institute', {
        error: error.message,
        stack: error.stack,
        instituteId: id
      });
      throw error;
    }
  };

  deleteInstitute = async (id) => {
    try {
      logger.info(`InstituteRepo >>>> deleteInstitute >>>> Deleting institute: ${id}`);
      const institute = await Institute.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
      
      if (!institute) {
        logger.error('InstituteRepo >>>> deleteInstitute >>>> Institute not found for deletion', { instituteId: id });
      } else {
        logger.info(`InstituteRepo >>>> deleteInstitute >>>> Institute deleted successfully`, { instituteId: id, code: institute.code });
      }
      
      return institute;
    } catch (error) {
      logger.error('InstituteRepo >>>> deleteInstitute >>>> Error deleting institute', {
        error: error.message,
        stack: error.stack,
        instituteId: id
      });
      throw error;
    }
  };

  getAllInstitutes = async (query = {}) => {
    try {
      const { page = 1, limit = 10, ...filterQuery } = query;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;
      
      logger.info(`InstituteRepo >>>> getAllInstitutes >>>> Fetching list`, { page: pageNum, limit: limitNum });
      
      // Fetch institutes - try with populate first, fallback to without populate on error
      let institutes;
      try {
        institutes = await Institute.find({ ...filterQuery, isDeleted: false })
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .populate('ownerId', 'firstName lastName email')
          .populate('logoId')
          .lean()
          .exec();
      } catch (populateError) {
        // If populate fails (e.g., invalid ObjectIds), fetch without populate
        logger.warn('InstituteRepo >>>> getAllInstitutes >>>> Populate failed, fetching without populate', {
          error: populateError.message
        });
        institutes = await Institute.find({ ...filterQuery, isDeleted: false })
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .lean()
          .exec();
      }
      
      const total = await Institute.countDocuments({ ...filterQuery, isDeleted: false });
      
      logger.info(`InstituteRepo >>>> getAllInstitutes >>>> Institutes fetched successfully`, {
        count: institutes.length,
        total,
        page: pageNum,
        limit: limitNum
      });
      
      return { institutes, total, page: pageNum, limit: limitNum };
    } catch (error) {
      logger.error('InstituteRepo >>>> getAllInstitutes >>>> Error fetching institutes', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };
}

export default new InstituteRepo();
