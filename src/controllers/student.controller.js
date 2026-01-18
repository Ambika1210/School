import studentService from '../services/student.service.js';
import logger from '../utils/logger.js';
import { getInstituteId } from '../middleware/contextStore.js';
import { 
  setCreateSuccess, 
  setSuccess, 
  setNotFoundError, 
  setServerError,
  setBadRequest
} from '../utils/responseHelper.js';

class StudentController {
  
  createStudent = async (req, res) => {
    try {
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error('StudentController >>>> createStudent >>>> Missing institute ID in token');
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      const {
        userId,
        admissionNumber,
        rollNumber,
        classId, // This is expected to be an ObjectId string for InstituteClass
        admissionDate,
        bloodGroup,
        aadharNumber,
        parentIds,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation
      } = req.body.student || {};

      // Validate required fields
      if (!userId || !admissionNumber) {
        logger.error('StudentController >>>> createStudent >>>> Missing required fields', {
          userId: !userId,
          admissionNumber: !admissionNumber
        });
        return setBadRequest(res, { message: 'Missing required fields: userId and admissionNumber are mandatory.' });
      }

      logger.info(`StudentController >>>> createStudent >>>> Creating student record for userId: ${userId}, instituteId: ${instituteId}`);

      const student = await studentService.createStudent({
        userId,
        instituteId,
        admissionNumber,
        rollNumber,
        currentClassId: classId, // Map classId from frontend to currentClassId in model
        admissionDate,
        bloodGroup,
        aadharNumber,
        parentIds: Array.isArray(parentIds) ? parentIds : [],
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation
      });
      
      logger.info(`StudentController >>>> createStudent >>>> Student created successfully`, { studentId: student._id });
      setCreateSuccess(res, {
        message: 'Student record created successfully',
        student
      });
    } catch (error) {
      logger.error('StudentController >>>> createStudent >>>> Error creating student', {
        error: error.message,
        stack: error.stack,
        userId: req.body.student?.userId,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };
  
  getAllStudents = async (req, res) => {
    try {
      // Get instituteId from context store (mandatory for security)
      // Users can only see students from their own institute
      const instituteId = getInstituteId();
      
      if (!instituteId) {
        logger.error('StudentController >>>> getAllStudents >>>> Missing institute ID in token');
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      // Get query parameters
      const {
        class: studentClass,
        section,
        academicSessionId,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = req.query;

      logger.info(`StudentController >>>> getAllStudents >>>> Fetching students for institute: ${instituteId}`, {
        filters: { studentClass, section, academicSessionId, isActive, isDeleted, page, limit }
      });

      const { students, total, page: currentPage, limit: currentLimit } = await studentService.getAllStudents({
        instituteId, // Mandatory - from JWT token
        class: studentClass,
        section,
        academicSessionId,
        isActive,
        isDeleted,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      logger.info(`StudentController >>>> getAllStudents >>>> Fetched ${students.length} students, total: ${total}`);
      
      setSuccess(res, {
        message: 'Students fetched successfully',
        students,
        pagination: {
          total,
          page: currentPage,
          limit: currentLimit,
          totalPages: Math.ceil(total / currentLimit)
        }
      });
    } catch (error) {
      logger.error('StudentController >>>> getAllStudents >>>> Error fetching students', {
        error: error.message,
        stack: error.stack,
        instituteId: req.user?.instituteId
      });
      setServerError(res, { message: error.message });
    }
  };

  getStudentById = async (req, res) => {
    try {
      const { id } = req.params;
      const instituteId = getInstituteId();

      if (!instituteId) {
        logger.error('StudentController >>>> getStudentById >>>> Missing institute ID in token');
        return setBadRequest(res, { message: 'Institute ID is required. User must belong to an institute.' });
      }

      logger.info(`StudentController >>>> getStudentById >>>> Fetching student: ${id} for institute: ${instituteId}`);
      const student = await studentService.getStudentById(id);
      
      if (!student) {
        logger.error('StudentController >>>> getStudentById >>>> Student not found', { studentId: id });
        return setNotFoundError(res, { message: 'Student not found' });
      }

      // Security check: Ensure student belongs to the same institute as the requesting user
      if (student.instituteId && student.instituteId._id && student.instituteId._id.toString() !== instituteId.toString()) {
        logger.error('StudentController >>>> getStudentById >>>> Access denied - Student belongs to different institute', {
          studentInstituteId: student.instituteId._id,
          userInstituteId: instituteId
        });
        return setBadRequest(res, { message: 'Access denied. Student belongs to a different institute.' });
      }
      
      logger.info(`StudentController >>>> getStudentById >>>> Student fetched successfully`, { studentId: id });
      setSuccess(res, {
        message: 'Student fetched successfully',
        student
      });
    } catch (error) {
      logger.error('StudentController >>>> getStudentById >>>> Error fetching student', {
        error: error.message,
        stack: error.stack,
        studentId: req.params.id
      });
      setServerError(res, { message: error.message });
    }
  };
}

export default new StudentController();

