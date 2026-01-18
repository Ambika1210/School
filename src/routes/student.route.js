import express from 'express';
import studentController from '../controllers/student.controller.js';
import { checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create student record (for users with STUDENT role)
router.post('/v1/student/create-student', checkPermission('CREATE_USER'), studentController.createStudent);

// Get all students (filtered by instituteId from JWT token)
router.get('/v1/student/get-all-students', checkPermission('GET_INSTITUTE_USERS'), studentController.getAllStudents);

// Get student by ID
router.get('/v1/student/:id/get-student', checkPermission('GET_INSTITUTE_USERS'), studentController.getStudentById);

export default router;
