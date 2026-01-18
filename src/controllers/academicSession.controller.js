import academicSessionService from '../services/academicSession.service.js';
import logger from '../utils/logger.js';
import { getInstituteId } from '../middleware/contextStore.js';
import { 
  setCreateSuccess, 
  setSuccess, 
  setNotFoundError, 
  setServerError,
  setBadRequest
} from '../utils/responseHelper.js';

class AcademicSessionController {
  
  createSession = async (req, res) => {
    try {
      const { name, startDate, endDate, isCurrent } = req.body.session || {};
      const instituteId = getInstituteId() || req.body.instituteId;

      if (!name || !startDate || !endDate) {
        logger.error('AcademicSessionController >>>> createSession >>>> Missing required fields', {
          missingFields: {
            name: !name,
            startDate: !startDate,
            endDate: !endDate
          }
        });
        return setBadRequest(res, { message: 'Missing required fields: name, startDate, and endDate are mandatory.' });
      }

      if (!instituteId) {
        logger.error('AcademicSessionController >>>> createSession >>>> Missing institute ID');
        return setBadRequest(res, { message: 'Institute ID is required for session creation.' });
      }

      logger.info(`AcademicSessionController >>>> createSession >>>> Creating session with name: ${name}, instituteId: ${instituteId}`);
      const session = await academicSessionService.createSession({
        name,
        startDate,
        endDate,
        isCurrent: isCurrent === true,
        instituteId
      });
      
      logger.info(`AcademicSessionController >>>> createSession >>>> Session created successfully`, { 
        sessionId: session._id, 
        name: session.name 
      });
      setCreateSuccess(res, {
        message: 'Academic session created successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> createSession >>>> Error creating session', {
        error: error.message,
        stack: error.stack,
        name: req.body.session?.name
      });
      setServerError(res, { message: error.message });
    }
  };

  getSessionById = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`AcademicSessionController >>>> getSessionById >>>> Fetching session details for ID: ${id}`);
      const session = await academicSessionService.getSessionById(id);
      
      if (!session) {
        logger.error('AcademicSessionController >>>> getSessionById >>>> Session not found', { sessionId: id });
        return setNotFoundError(res, { message: 'Academic session not found' });
      }
      
      logger.info(`AcademicSessionController >>>> getSessionById >>>> Session fetched successfully`, { 
        sessionId: id, 
        name: session.name 
      });
      setSuccess(res, {
        message: 'Academic session fetched successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> getSessionById >>>> Error fetching session', {
        error: error.message,
        stack: error.stack,
        sessionId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  getAllSessions = async (req, res) => {
    try {
      const { instituteId, isCurrent, isActive } = req.query;
      const queryInstituteId = getInstituteId() || instituteId;

      logger.info(`AcademicSessionController >>>> getAllSessions >>>> Fetching sessions`, { 
        instituteId: queryInstituteId, 
        isCurrent, 
        isActive 
      });

      const query = {};
      if (queryInstituteId) query.instituteId = queryInstituteId;
      if (isCurrent !== undefined) query.isCurrent = isCurrent;
      if (isActive !== undefined) query.isActive = isActive;

      const sessions = await academicSessionService.getAllSessions(query);
      
      logger.info(`AcademicSessionController >>>> getAllSessions >>>> Sessions fetched successfully`, {
        count: sessions.length
      });
      setSuccess(res, {
        message: 'Academic sessions fetched successfully',
        sessions,
        count: sessions.length
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> getAllSessions >>>> Error fetching sessions', {
        error: error.message,
        stack: error.stack
      });
      setServerError(res, { message: error.message });
    }
  };

  getCurrentSession = async (req, res) => {
    try {
      const instituteId = getInstituteId() || req.query.instituteId;

      if (!instituteId) {
        logger.error('AcademicSessionController >>>> getCurrentSession >>>> Missing institute ID');
        return setBadRequest(res, { message: 'Institute ID is required.' });
      }

      logger.info(`AcademicSessionController >>>> getCurrentSession >>>> Fetching current session for institute: ${instituteId}`);
      const session = await academicSessionService.getCurrentSession(instituteId);
      
      if (!session) {
        logger.info(`AcademicSessionController >>>> getCurrentSession >>>> No current session found`);
        return setSuccess(res, {
          message: 'No current session found',
          session: null
        });
      }

      logger.info(`AcademicSessionController >>>> getCurrentSession >>>> Current session fetched successfully`, { 
        sessionId: session._id, 
        name: session.name 
      });
      setSuccess(res, {
        message: 'Current academic session fetched successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> getCurrentSession >>>> Error fetching current session', {
        error: error.message,
        stack: error.stack
      });
      setServerError(res, { message: error.message });
    }
  };

  updateSession = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body.session || {};

      logger.info(`AcademicSessionController >>>> updateSession >>>> Updating session: ${id}`);
      const session = await academicSessionService.updateSession(id, updateData);
      
      if (!session) {
        logger.error('AcademicSessionController >>>> updateSession >>>> Session not found', { sessionId: id });
        return setNotFoundError(res, { message: 'Academic session not found' });
      }

      logger.info(`AcademicSessionController >>>> updateSession >>>> Session updated successfully`, { 
        sessionId: id, 
        name: session.name 
      });
      setSuccess(res, {
        message: 'Academic session updated successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> updateSession >>>> Error updating session', {
        error: error.message,
        stack: error.stack,
        sessionId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  setCurrentSession = async (req, res) => {
    try {
      const { id } = req.params;
      const instituteId = getInstituteId() || req.body.instituteId;

      if (!instituteId) {
        logger.error('AcademicSessionController >>>> setCurrentSession >>>> Missing institute ID');
        return setBadRequest(res, { message: 'Institute ID is required.' });
      }

      logger.info(`AcademicSessionController >>>> setCurrentSession >>>> Setting current session`, { 
        instituteId, 
        sessionId: id 
      });
      const session = await academicSessionService.setCurrentSession(instituteId, id);
      
      logger.info(`AcademicSessionController >>>> setCurrentSession >>>> Current session set successfully`, { 
        sessionId: id, 
        name: session.name 
      });
      setSuccess(res, {
        message: 'Current academic session set successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> setCurrentSession >>>> Error setting current session', {
        error: error.message,
        stack: error.stack,
        sessionId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  deleteSession = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info(`AcademicSessionController >>>> deleteSession >>>> Deleting session: ${id}`);
      const session = await academicSessionService.deleteSession(id);
      
      logger.info(`AcademicSessionController >>>> deleteSession >>>> Session deleted successfully`, { 
        sessionId: id 
      });
      setSuccess(res, {
        message: 'Academic session deleted successfully',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> deleteSession >>>> Error deleting session', {
        error: error.message,
        stack: error.stack,
        sessionId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };

  findSessionByDate = async (req, res) => {
    try {
      const { date } = req.query;
      const instituteId = getInstituteId() || req.query.instituteId;

      if (!instituteId) {
        logger.error('AcademicSessionController >>>> findSessionByDate >>>> Missing institute ID');
        return setBadRequest(res, { message: 'Institute ID is required.' });
      }

      if (!date) {
        logger.error('AcademicSessionController >>>> findSessionByDate >>>> Missing date');
        return setBadRequest(res, { message: 'Date is required.' });
      }

      logger.info(`AcademicSessionController >>>> findSessionByDate >>>> Finding session for date: ${date}, instituteId: ${instituteId}`);
      const session = await academicSessionService.findSessionByDate(instituteId, date);
      
      if (!session) {
        logger.info(`AcademicSessionController >>>> findSessionByDate >>>> No session found for date`);
        return setSuccess(res, {
          message: 'No session found for the given date',
          session: null
        });
      }

      logger.info(`AcademicSessionController >>>> findSessionByDate >>>> Session found`, { 
        sessionId: session._id, 
        name: session.name 
      });
      setSuccess(res, {
        message: 'Session found for the given date',
        session
      });
    } catch (error) {
      logger.error('AcademicSessionController >>>> findSessionByDate >>>> Error finding session by date', {
        error: error.message,
        stack: error.stack
      });
      setServerError(res, { message: error.message });
    }
  };
}

export default new AcademicSessionController();

