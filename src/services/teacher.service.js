import teacherRepo from '../repo/teacher.repo.js';
import userRepo from '../repo/user.repo.js';
import logger from '../utils/logger.js';
import { TEACHER } from '../constants/enums.js';
import { TEACHER_NOT_FOUND } from '../constants/errorConstants.js';

class TeacherService {
  
  createTeacher = async (data) => {
    try {
      logger.info(`TeacherService >>>> createTeacher >>>> Processing creation for userId: ${data.userId}, instituteId: ${data.instituteId}`);
      
      // Validate required fields
      if (!data.userId || !data.instituteId) {
        throw new Error('Missing required fields: userId and instituteId are mandatory.');
      }

      // Check if user exists and has TEACHER role
      const user = await userRepo.getUserById(data.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== TEACHER) {
        throw new Error('User must have TEACHER role to create teacher record');
      }

      // Check institute match
      const userInstituteId = user.instituteId ? user.instituteId.toString() : null;
      const dataInstituteId = data.instituteId ? data.instituteId.toString() : null;
      
      if (userInstituteId && dataInstituteId && userInstituteId !== dataInstituteId) {
        throw new Error('User belongs to a different institute');
      }

      const teacher = await teacherRepo.createTeacher(data);
      
      logger.info(`TeacherService >>>> createTeacher >>>> Teacher created successfully`, { teacherId: teacher._id });
      
      // Update User model with profileId
      await userRepo.updateUserProfileId(data.userId, teacher._id);
      
      return teacher;
    } catch (error) {
      logger.error(`TeacherService >>>> createTeacher >>>> Error creating teacher: ${error.message}`, {
        userId: data?.userId,
        instituteId: data?.instituteId
      });
      throw error;
    }
  };

  getTeacherById = async (id) => {
    try {
      logger.info(`TeacherService >>>> getTeacherById >>>> Request for ID: ${id}`);
      const teacher = await teacherRepo.getTeacherById(id);
      
      if (!teacher) {
        logger.error(`TeacherService >>>> getTeacherById >>>> Teacher not found for id: ${id}`, { teacherId: id });
        throw new Error(TEACHER_NOT_FOUND);
      } else {
        logger.info(`TeacherService >>>> getTeacherById >>>> Teacher fetched successfully for id: ${id}`, { teacherId: id });
      }
      
      return teacher;
    } catch (error) {
      logger.error(`TeacherService >>>> getTeacherById >>>> Error fetching teacher: ${error.message}`, {
        stack: error.stack,
        teacherId: id
      });
      throw error;
    }
  };

  getAllTeachers = async (query) => {
    try {
      logger.info(`TeacherService >>>> getAllTeachers >>>> Fetching all teachers for institute: ${query.instituteId}`);
      
      if (!query.instituteId) {
        throw new Error('Institute ID is required to fetch teachers.');
      }

      const { teachers, total, page, limit } = await teacherRepo.getAllTeachers(query);
      
      logger.info(`TeacherService >>>> getAllTeachers >>>> Fetched ${teachers.length} teachers, total: ${total}`);
      return { teachers, total, page, limit };
    } catch (error) {
      logger.error(`TeacherService >>>> getAllTeachers >>>> Error fetching all teachers: ${error.message}`, {
        stack: error.stack,
        query
      });
      throw error;
    }
  };
}

export default new TeacherService();
