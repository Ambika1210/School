import express from 'express';
import teacherController from '../controllers/teacher.controller.js';
import { checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create teacher record (for users with TEACHER role)
router.post('/v1/teacher/create-teacher', checkPermission('CREATE_USER'), teacherController.createTeacher);

// Get all teachers (filtered by instituteId from JWT token)
router.get('/v1/teacher/get-all-teachers', checkPermission('GET_INSTITUTE_USERS'), teacherController.getAllTeachers);

// Get teacher by ID
router.get('/v1/teacher/:id/get-teacher-details', checkPermission('GET_INSTITUTE_USERS'), teacherController.getTeacherById);

export default router;
