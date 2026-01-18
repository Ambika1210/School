import AcademicSession from '../models/academicSession.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

class AcademicSessionRepo {
  
  createSession = async (data) => {
    try {
      logger.info(`AcademicSessionRepo >>>> createSession >>>> Creating session with name: ${data.name}, instituteId: ${data.instituteId}`);
      const session = await AcademicSession.create(data);
      
      logger.info(`AcademicSessionRepo >>>> createSession >>>> Session created successfully`, { 
        sessionId: session._id, 
        name: session.name,
        instituteId: session.instituteId 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> createSession >>>> Error creating session', {
        error: error.message,
        stack: error.stack,
        name: data?.name,
        instituteId: data?.instituteId
      });
      throw error;
    }
  };

  getSessionById = async (id) => {
    try {
      logger.info(`AcademicSessionRepo >>>> getSessionById >>>> Fetching session: ${id}`);
      
      const sessionId = new mongoose.Types.ObjectId(id);
      const session = await AcademicSession.findById(sessionId).lean();

      if (!session) {
        logger.error('AcademicSessionRepo >>>> getSessionById >>>> Session not found', { sessionId: id });
        return null;
      }

      logger.info(`AcademicSessionRepo >>>> getSessionById >>>> Session fetched successfully`, { 
        sessionId: id, 
        name: session.name 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> getSessionById >>>> Error fetching session', {
        error: error.message,
        stack: error.stack,
        errorName: error.name,
        sessionId: id
      });
      throw error;
    }
  };

  getAllSessions = async (query = {}) => {
    try {
      const { instituteId, isCurrent, isActive, ...filterQuery } = query;
      
      logger.info(`AcademicSessionRepo >>>> getAllSessions >>>> Fetching sessions`, { 
        instituteId, 
        isCurrent, 
        isActive 
      });

      const filter = { ...filterQuery, isDeleted: false };
      
      if (instituteId) {
        filter.instituteId = new mongoose.Types.ObjectId(instituteId);
      }
      
      if (isCurrent !== undefined) {
        filter.isCurrent = isCurrent === true || isCurrent === 'true';
      }
      
      if (isActive !== undefined) {
        filter.isActive = isActive === true || isActive === 'true';
      }

      const sessions = await AcademicSession.find(filter)
        .sort({ startDate: -1 }) // Latest first
        .lean();

      logger.info(`AcademicSessionRepo >>>> getAllSessions >>>> Sessions fetched successfully`, {
        count: sessions.length,
        instituteId,
        isCurrent,
        isActive
      });

      return sessions;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> getAllSessions >>>> Error fetching sessions', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  getCurrentSession = async (instituteId) => {
    try {
      logger.info(`AcademicSessionRepo >>>> getCurrentSession >>>> Fetching current session for institute: ${instituteId}`);
      
      const instituteObjectId = new mongoose.Types.ObjectId(instituteId);
      const session = await AcademicSession.findOne({
        instituteId: instituteObjectId,
        isCurrent: true,
        isActive: true,
        isDeleted: false
      }).lean();

      if (session) {
        logger.info(`AcademicSessionRepo >>>> getCurrentSession >>>> Current session found`, { 
          sessionId: session._id, 
          name: session.name 
        });
      } else {
        logger.info(`AcademicSessionRepo >>>> getCurrentSession >>>> No current session found for institute: ${instituteId}`);
      }

      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> getCurrentSession >>>> Error fetching current session', {
        error: error.message,
        stack: error.stack,
        instituteId
      });
      throw error;
    }
  };

  updateSession = async (id, data) => {
    try {
      logger.info(`AcademicSessionRepo >>>> updateSession >>>> Updating session: ${id}`);
      
      const sessionId = new mongoose.Types.ObjectId(id);
      const session = await AcademicSession.findByIdAndUpdate(
        sessionId,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!session) {
        logger.error('AcademicSessionRepo >>>> updateSession >>>> Session not found', { sessionId: id });
        return null;
      }

      logger.info(`AcademicSessionRepo >>>> updateSession >>>> Session updated successfully`, { 
        sessionId: id, 
        name: session.name 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> updateSession >>>> Error updating session', {
        error: error.message,
        stack: error.stack,
        sessionId: id
      });
      throw error;
    }
  };

  setCurrentSession = async (instituteId, sessionId) => {
    try {
      logger.info(`AcademicSessionRepo >>>> setCurrentSession >>>> Setting current session`, { 
        instituteId, 
        sessionId 
      });
      
      const instituteObjectId = new mongoose.Types.ObjectId(instituteId);
      const newSessionId = new mongoose.Types.ObjectId(sessionId);

      // First, unset all current sessions for this institute
      await AcademicSession.updateMany(
        { 
          instituteId: instituteObjectId,
          isCurrent: true 
        },
        { 
          $set: { isCurrent: false } 
        }
      );

      // Then set the new session as current
      const session = await AcademicSession.findByIdAndUpdate(
        newSessionId,
        { 
          $set: { 
            isCurrent: true,
            isActive: true 
          } 
        },
        { new: true, runValidators: true }
      ).lean();

      if (!session) {
        logger.error('AcademicSessionRepo >>>> setCurrentSession >>>> Session not found', { sessionId });
        return null;
      }

      logger.info(`AcademicSessionRepo >>>> setCurrentSession >>>> Current session set successfully`, { 
        sessionId, 
        name: session.name 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> setCurrentSession >>>> Error setting current session', {
        error: error.message,
        stack: error.stack,
        instituteId,
        sessionId
      });
      throw error;
    }
  };

  deleteSession = async (id) => {
    try {
      logger.info(`AcademicSessionRepo >>>> deleteSession >>>> Soft deleting session: ${id}`);
      
      const sessionId = new mongoose.Types.ObjectId(id);
      const session = await AcademicSession.findByIdAndUpdate(
        sessionId,
        { 
          $set: { 
            isDeleted: true,
            isActive: false,
            isCurrent: false 
          } 
        },
        { new: true }
      ).lean();

      if (!session) {
        logger.error('AcademicSessionRepo >>>> deleteSession >>>> Session not found', { sessionId: id });
        return null;
      }

      logger.info(`AcademicSessionRepo >>>> deleteSession >>>> Session deleted successfully`, { 
        sessionId: id 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> deleteSession >>>> Error deleting session', {
        error: error.message,
        stack: error.stack,
        sessionId: id
      });
      throw error;
    }
  };

  /**
   * Find session that contains a specific date
   * Useful for finding which session a date falls into
   * @param {string} instituteId - Institute ID
   * @param {Date|string} date - Date to check
   * @returns {Object|null} - Session object or null
   */
  findSessionByDate = async (instituteId, date) => {
    try {
      logger.info(`AcademicSessionRepo >>>> findSessionByDate >>>> Finding session for date: ${date}, instituteId: ${instituteId}`);
      
      const instituteObjectId = new mongoose.Types.ObjectId(instituteId);
      const checkDate = new Date(date);
      
      // Set time to start of day for accurate comparison
      checkDate.setHours(0, 0, 0, 0);

      const session = await AcademicSession.findOne({
        instituteId: instituteObjectId,
        startDate: { $lte: checkDate },
        endDate: { $gte: checkDate },
        isActive: true,
        isDeleted: false
      }).lean();

      if (session) {
        logger.info(`AcademicSessionRepo >>>> findSessionByDate >>>> Session found`, { 
          sessionId: session._id, 
          name: session.name 
        });
      } else {
        logger.info(`AcademicSessionRepo >>>> findSessionByDate >>>> No session found for date: ${date}`);
      }

      return session;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> findSessionByDate >>>> Error finding session by date', {
        error: error.message,
        stack: error.stack,
        instituteId,
        date
      });
      throw error;
    }
  };

  /**
   * Get sessions within a date range
   * @param {string} instituteId - Institute ID
   * @param {Date|string} startDate - Range start date
   * @param {Date|string} endDate - Range end date
   * @returns {Array} - Array of sessions
   */
  getSessionsInDateRange = async (instituteId, startDate, endDate) => {
    try {
      logger.info(`AcademicSessionRepo >>>> getSessionsInDateRange >>>> Finding sessions in range`, { 
        instituteId, 
        startDate, 
        endDate 
      });
      
      const instituteObjectId = new mongoose.Types.ObjectId(instituteId);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      // Find sessions that overlap with the given date range
      const sessions = await AcademicSession.find({
        instituteId: instituteObjectId,
        startDate: { $lte: rangeEnd },
        endDate: { $gte: rangeStart },
        isActive: true,
        isDeleted: false
      })
      .sort({ startDate: 1 })
      .lean();

      logger.info(`AcademicSessionRepo >>>> getSessionsInDateRange >>>> Sessions found`, {
        count: sessions.length
      });

      return sessions;
    } catch (error) {
      logger.error('AcademicSessionRepo >>>> getSessionsInDateRange >>>> Error finding sessions in date range', {
        error: error.message,
        stack: error.stack,
        instituteId,
        startDate,
        endDate
      });
      throw error;
    }
  };
}

export default new AcademicSessionRepo();

