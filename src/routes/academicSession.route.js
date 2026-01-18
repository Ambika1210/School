import express from 'express';
import academicSessionController from '../controllers/academicSession.controller.js';
import { checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create new academic session (Institute Admin only)
router.post('/v1/academic-session/create', checkPermission('CREATE_USER'), academicSessionController.createSession);

// Get all sessions for an institute
router.get('/v1/academic-session/get-all', checkPermission('GET_INSTITUTE_USERS'), academicSessionController.getAllSessions);

// Get current session for an institute
router.get('/v1/academic-session/get-current', checkPermission('GET_INSTITUTE_USERS'), academicSessionController.getCurrentSession);

// Find session by date (which session does a date fall into)
router.get('/v1/academic-session/find-by-date', checkPermission('GET_INSTITUTE_USERS'), academicSessionController.findSessionByDate);

// Get session by ID
router.get('/v1/academic-session/:id/get-details', checkPermission('GET_INSTITUTE_USERS'), academicSessionController.getSessionById);

// Update session
router.patch('/v1/academic-session/:id/update', checkPermission('UPDATE_USER'), academicSessionController.updateSession);

// Set current session
router.patch('/v1/academic-session/:id/set-current', checkPermission('UPDATE_USER'), academicSessionController.setCurrentSession);

// Delete session (soft delete)
router.delete('/v1/academic-session/:id/delete', checkPermission('DELETE_USER'), academicSessionController.deleteSession);

export default router;

