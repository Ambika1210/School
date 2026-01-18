import express from 'express';
import userController from '../controllers/user.controller.js';

import { checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/v1/user/login', userController.login);

// Super Admin creation (only super admin can create)
router.post('/v1/user/create-super-admin', checkPermission('CREATE_INSTITUTE_ADMIN'), userController.createSuperAdmin);

// Institute Admin creation (only super admin can create)
router.post('/v1/user/create-institute-admin', checkPermission('CREATE_INSTITUTE_ADMIN'), userController.createInstituteAdmin);

// Institute User creation (institute admin can create - STUDENT, TEACHER, PARENT, STAFF, USER)
router.post('/v1/user/create-institute-user', checkPermission('CREATE_USER'), userController.createInstituteUser);

// User APIs
// Get all users (filtered by instituteId from JWT token - users can only see their own institute's users)
// Can filter by role: TEACHER, PARENT, STAFF, USER, etc.
router.get('/v1/user/get-all-users', checkPermission('GET_INSTITUTE_USERS'), userController.getAllUsers);

// Get users without profile (users with any role but no linked profile record)
// Useful for populating dropdowns when creating Student/Teacher profiles
router.get('/v1/user/get-users-without-profile', checkPermission('GET_INSTITUTE_USERS'), userController.getUsersWithoutProfile);



export default router;

