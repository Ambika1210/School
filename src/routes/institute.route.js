import express from 'express';
import instituteController from '../controllers/institute.controller.js';
import { checkPermission } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/v1/institute/create-new-institute',checkPermission('CREATE_NEW_INSTITUTES'), instituteController.instituteCreate);
router.get('/v1/institute/get-all-institute', checkPermission('GET_ALL_INSTITUTES'), instituteController.allInstitute);
router.get('/v1/institute/:id/get-institute-details', checkPermission('GET_INSTITUTE_BY_ID'), instituteController.instituteGet);
router.patch('/v1/institute/:id/update-institute', checkPermission('UPDATE_INSTITUTE'), instituteController.instituteUpdate);
router.delete('/v1/institute/:id/delete-institute', checkPermission('DELETE_INSTITUTE'), instituteController.instituteDelete);
router.get('/v1/institute/:id/admins', checkPermission('GET_INSTITUTE_BY_ID'), instituteController.getInstituteAdmins);

export default router;
