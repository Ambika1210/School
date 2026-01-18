import express from 'express';
import classController from '../controllers/instituteClass.controller.js';
import { checkPermission } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/v1/instituteClass/create-class', checkPermission('CREATE_CLASS'), classController.createClass);

router.get('/v1/instituteClass/get-all-classes', checkPermission('GET_CLASSES'), classController.getAllClasses);

router.get('/v1/instituteClass/:id/get-class-details', checkPermission('GET_CLASSES'), classController.getClassById);
router.put('/v1/instituteClass/:id/update-class', checkPermission('UPDATE_CLASS'), classController.updateClass);
router.delete('/v1/instituteClass/:id/delete-class', checkPermission('DELETE_CLASS'), classController.deleteClass);

export default router;
