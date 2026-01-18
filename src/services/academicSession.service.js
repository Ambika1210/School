import academicSessionRepo from '../repo/academicSession.repo.js';
import logger from '../utils/logger.js';
import { validateDateRange, doDateRangesOverlap, isDateInRange } from '../utils/dateHelper.js';

class AcademicSessionService {
  
  createSession = async (data) => {
    try {
      logger.info(`AcademicSessionService >>>> createSession >>>> Processing creation for name: ${data.name}, instituteId: ${data.instituteId}`);
      
      // Validate date range using helper
      const dateValidation = validateDateRange(data.startDate, data.endDate);
      if (!dateValidation.valid) {
        logger.error('AcademicSessionService >>>> createSession >>>> Invalid date range', { error: dateValidation.error });
        throw new Error(dateValidation.error);
      }

      /**
       * Check for overlapping sessions
       * 
       * Overlapping means: Two sessions have date ranges that share common dates
       * 
       * Example of OVERLAPPING:
       * - Session 1: April 1, 2024 to March 31, 2025
       * - Session 2: June 1, 2024 to May 31, 2025
       * - Overlap: Both active from June 2024 to March 2025 ❌
       * 
       * Example of NON-OVERLAPPING:
       * - Session 1: April 1, 2024 to March 31, 2025
       * - Session 2: April 1, 2025 to March 31, 2026
       * - No overlap: Consecutive sessions ✅
       * 
       * Why check? Prevents confusion about which session is active and ensures
       * students are assigned to correct academic year.
       * 
       * Currently: We log a warning but allow overlaps (useful for summer sessions, etc.)
       * To prevent overlaps: Change warning to throw error
       */
      const existingSessions = await academicSessionRepo.getAllSessions({
        instituteId: data.instituteId,
        isDeleted: false
      });

      const newRange = {
        startDate: data.startDate,
        endDate: data.endDate
      };

      // Check if new session overlaps with existing active sessions
      const hasOverlap = existingSessions.some(session => {
        if (!session.isActive || session.isDeleted) return false;
        return doDateRangesOverlap(newRange, {
          startDate: session.startDate,
          endDate: session.endDate
        });
      });

      if (hasOverlap) {
        logger.warn('AcademicSessionService >>>> createSession >>>> Overlapping session detected', {
          instituteId: data.instituteId,
          startDate: data.startDate,
          endDate: data.endDate,
          message: 'New session date range overlaps with existing active session. This may cause confusion about which session is active.'
        });
        // Currently: We allow overlaps but log warning
        // To prevent overlaps, uncomment below:
        // throw new Error('Cannot create session: Date range overlaps with existing active session. Please use non-overlapping dates.');
      }

      // If this session is marked as current, unset other current sessions
      if (data.isCurrent) {
        await academicSessionRepo.setCurrentSession(data.instituteId, null);
        // We'll set it after creation
        data.isCurrent = false; // Temporarily set to false
      }

      const session = await academicSessionRepo.createSession(data);

      // If it should be current, set it now
      if (data.isCurrent) {
        await academicSessionRepo.setCurrentSession(data.instituteId, session._id);
        session.isCurrent = true;
      }

      logger.info(`AcademicSessionService >>>> createSession >>>> Session created successfully`, { 
        sessionId: session._id, 
        name: session.name 
      });
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> createSession >>>> Error creating session', {
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
      logger.info(`AcademicSessionService >>>> getSessionById >>>> Request for ID: ${id}`);
      const session = await academicSessionRepo.getSessionById(id);
      
      if (!session) {
        logger.error('AcademicSessionService >>>> getSessionById >>>> Session not found', { sessionId: id });
      } else {
        logger.info(`AcademicSessionService >>>> getSessionById >>>> Session fetched successfully`, { 
          sessionId: id, 
          name: session.name 
        });
      }
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> getSessionById >>>> Error fetching session', {
        error: error.message,
        stack: error.stack,
        sessionId: id
      });
      throw error;
    }
  };

  getAllSessions = async (query) => {
    try {
      logger.info(`AcademicSessionService >>>> getAllSessions >>>> Fetching sessions`, { query });
      const sessions = await academicSessionRepo.getAllSessions(query);
      
      logger.info(`AcademicSessionService >>>> getAllSessions >>>> Sessions fetched successfully`, {
        count: sessions.length
      });
      
      return sessions;
    } catch (error) {
      logger.error('AcademicSessionService >>>> getAllSessions >>>> Error fetching sessions', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  getCurrentSession = async (instituteId) => {
    try {
      logger.info(`AcademicSessionService >>>> getCurrentSession >>>> Fetching current session for institute: ${instituteId}`);
      const session = await academicSessionRepo.getCurrentSession(instituteId);
      
      if (session) {
        logger.info(`AcademicSessionService >>>> getCurrentSession >>>> Current session found`, { 
          sessionId: session._id, 
          name: session.name 
        });
      } else {
        logger.info(`AcademicSessionService >>>> getCurrentSession >>>> No current session found`);
      }
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> getCurrentSession >>>> Error fetching current session', {
        error: error.message,
        stack: error.stack,
        instituteId
      });
      throw error;
    }
  };

  updateSession = async (id, data) => {
    try {
      logger.info(`AcademicSessionService >>>> updateSession >>>> Updating session: ${id}`);
      
      // Get existing session to check for overlaps
      const existingSession = await academicSessionRepo.getSessionById(id);
      if (!existingSession) {
        throw new Error('Session not found');
      }

      // If updating dates, validate them
      const startDate = data.startDate || existingSession.startDate;
      const endDate = data.endDate || existingSession.endDate;

      if (data.startDate || data.endDate) {
        const dateValidation = validateDateRange(startDate, endDate);
        if (!dateValidation.valid) {
          logger.error('AcademicSessionService >>>> updateSession >>>> Invalid date range', { error: dateValidation.error });
          throw new Error(dateValidation.error);
        }

        // Check for overlaps with other sessions (excluding current session)
        const otherSessions = await academicSessionRepo.getAllSessions({
          instituteId: existingSession.instituteId,
          isDeleted: false
        });

        const updatedRange = {
          startDate: startDate,
          endDate: endDate
        };

        const hasOverlap = otherSessions.some(session => {
          if (session._id.toString() === id || !session.isActive || session.isDeleted) return false;
          return doDateRangesOverlap(updatedRange, {
            startDate: session.startDate,
            endDate: session.endDate
          });
        });

        if (hasOverlap) {
          logger.warn('AcademicSessionService >>>> updateSession >>>> Overlapping session detected');
          // Allow it but log warning
        }
      }

      // If setting as current, unset other current sessions first
      if (data.isCurrent === true) {
        const session = await academicSessionRepo.getSessionById(id);
        if (session) {
          await academicSessionRepo.setCurrentSession(session.instituteId, id);
        }
      }

      const session = await academicSessionRepo.updateSession(id, data);
      
      if (!session) {
        logger.error('AcademicSessionService >>>> updateSession >>>> Session not found', { sessionId: id });
      } else {
        logger.info(`AcademicSessionService >>>> updateSession >>>> Session updated successfully`, { 
          sessionId: id, 
          name: session.name 
        });
      }
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> updateSession >>>> Error updating session', {
        error: error.message,
        stack: error.stack,
        sessionId: id
      });
      throw error;
    }
  };

  setCurrentSession = async (instituteId, sessionId) => {
    try {
      logger.info(`AcademicSessionService >>>> setCurrentSession >>>> Setting current session`, { 
        instituteId, 
        sessionId 
      });
      
      const session = await academicSessionRepo.setCurrentSession(instituteId, sessionId);
      
      if (!session) {
        logger.error('AcademicSessionService >>>> setCurrentSession >>>> Session not found', { sessionId });
        throw new Error('Session not found');
      }

      logger.info(`AcademicSessionService >>>> setCurrentSession >>>> Current session set successfully`, { 
        sessionId, 
        name: session.name 
      });
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> setCurrentSession >>>> Error setting current session', {
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
      logger.info(`AcademicSessionService >>>> deleteSession >>>> Deleting session: ${id}`);
      const session = await academicSessionRepo.deleteSession(id);
      
      if (!session) {
        logger.error('AcademicSessionService >>>> deleteSession >>>> Session not found', { sessionId: id });
        throw new Error('Session not found');
      }

      logger.info(`AcademicSessionService >>>> deleteSession >>>> Session deleted successfully`, { 
        sessionId: id 
      });
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> deleteSession >>>> Error deleting session', {
        error: error.message,
        stack: error.stack,
        sessionId: id
      });
      throw error;
    }
  };

  /**
   * Find session that contains a specific date
   * Useful for determining which session a date belongs to
   * @param {string} instituteId - Institute ID
   * @param {Date|string} date - Date to check
   * @returns {Object|null} - Session object or null
   */
  findSessionByDate = async (instituteId, date) => {
    try {
      logger.info(`AcademicSessionService >>>> findSessionByDate >>>> Finding session for date: ${date}, instituteId: ${instituteId}`);
      const session = await academicSessionRepo.findSessionByDate(instituteId, date);
      
      if (session) {
        logger.info(`AcademicSessionService >>>> findSessionByDate >>>> Session found`, { 
          sessionId: session._id, 
          name: session.name 
        });
      } else {
        logger.info(`AcademicSessionService >>>> findSessionByDate >>>> No session found for date`);
      }
      
      return session;
    } catch (error) {
      logger.error('AcademicSessionService >>>> findSessionByDate >>>> Error finding session by date', {
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
      logger.info(`AcademicSessionService >>>> getSessionsInDateRange >>>> Finding sessions in range`, { 
        instituteId, 
        startDate, 
        endDate 
      });
      
      const sessions = await academicSessionRepo.getSessionsInDateRange(instituteId, startDate, endDate);
      
      logger.info(`AcademicSessionService >>>> getSessionsInDateRange >>>> Sessions found`, {
        count: sessions.length
      });
      
      return sessions;
    } catch (error) {
      logger.error('AcademicSessionService >>>> getSessionsInDateRange >>>> Error finding sessions in date range', {
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

export default new AcademicSessionService();

