import teacherService from '../services/teacher.service.js';
import logger from '../utils/logger.js';
import { getInstituteId } from '../middleware/contextStore.js';
import { TEACHER_NOT_FOUND } from '../constants/errorConstants.js';
import { 
  setCreateSuccess, 
  setSuccess, 
  setNotFoundError, 
  setServerError,
  setBadRequest
} from '../utils/responseHelper.js';

class TeacherController {
  
  createTeacher = async (req, res) => {
    try {
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error(`TeacherController >>>> createTeacher >>>> Missing institute ID in token`);
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      const {
        userId,
        designation,
        department,
        qualification,
        experience,
        joiningDate,
        specialization,
        subjects
      } = req.body.teacher || {};

      // Validate required fields
      if (!userId) {
        logger.error(`TeacherController >>>> createTeacher >>>> Missing required fields: userId`, {
          userId: !userId
        });
        return setBadRequest(res, { message: 'Missing required fields: userId is mandatory.' });
      }

      logger.info(`TeacherController >>>> createTeacher >>>> Creating teacher record for userId: ${userId}, instituteId: ${instituteId}`);

      const teacher = await teacherService.createTeacher({
        userId,
        instituteId,
        designation,
        department,
        qualification: Array.isArray(qualification) ? qualification : [],
        experience,
        joiningDate,
        specialization,
        subjects: Array.isArray(subjects) ? subjects : []
      });
      
      logger.info(`TeacherController >>>> createTeacher >>>> Teacher created successfully`, { teacherId: teacher._id });
      setCreateSuccess(res, {
        message: 'Teacher record created successfully',
        teacher
      });
    } catch (error) {
      logger.error(`TeacherController >>>> createTeacher >>>> Error creating teacher: ${error.message}`, {
        stack: error.stack,
        userId: req.body.teacher?.userId,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };
  
  getAllTeachers = async (req, res) => {
    try {
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error(`TeacherController >>>> getAllTeachers >>>> Missing institute ID in token`);
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      // Get query parameters
      const {
        designation,
        department,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = req.query;

      logger.info(`TeacherController >>>> getAllTeachers >>>> Fetching teachers for institute: ${instituteId}`, {
        filters: { designation, department, isActive, isDeleted, page, limit }
      });

      const { teachers, total, page: currentPage, limit: currentLimit } = await teacherService.getAllTeachers({
        instituteId,
        designation,
        department,
        isActive,
        isDeleted,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      logger.info(`TeacherController >>>> getAllTeachers >>>> Fetched ${teachers.length} teachers, total: ${total}`);
      
      setSuccess(res, {
        message: 'Teachers fetched successfully',
        teachers,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        }
      });
    } catch (error) {
      logger.error(`TeacherController >>>> getAllTeachers >>>> Error fetching teachers: ${error.message}`, {
        error: error.message,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };

  getTeacherById = async (req, res) => {
    try {
      const { id } = req.params;
      const instituteId = getInstituteId();

      if (!instituteId) {
        logger.error(`TeacherController >>>> getTeacherById >>>> Missing institute ID in token`);
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      logger.info(`TeacherController >>>> getTeacherById >>>> Fetching teacher: ${id} for institute: ${instituteId}`);
      const teacher = await teacherService.getTeacherById(id);
      
      // Security check: Ensure teacher belongs to the same institute as the requesting user
      if (teacher.instituteId && teacher.instituteId._id && teacher.instituteId._id.toString() !== instituteId.toString()) {
        logger.error(`TeacherController >>>> getTeacherById >>>> Access denied - Teacher belongs to different institute`, {
          teacherInstituteId: teacher.instituteId._id,
          userInstituteId: instituteId
        });
        return setBadRequest(res, { message: 'Access denied. Teacher belongs to a different institute.' });
      }
      
      logger.info(`TeacherController >>>> getTeacherById >>>> Teacher fetched successfully`, { teacherId: id });
      setSuccess(res, {
        message: 'Teacher fetched successfully',
        teacher
      });
    } catch (error) {
      if (error.message === TEACHER_NOT_FOUND) {
        logger.error(`TeacherController >>>> getTeacherById >>>> Teacher not found`, { teacherId: req.params.id });
        return setNotFoundError(res, { message: error.message });
      }
      logger.error(`TeacherController >>>> getTeacherById >>>> Error fetching teacher: ${error.message}`, {
        stack: error.stack,
        teacherId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };
}

export default new TeacherController();
