import studentRepo from '../repo/student.repo.js';
import userRepo from '../repo/user.repo.js';
import logger from '../utils/logger.js';
import { STUDENT } from '../constants/enums.js';
import instituteClassRepo from '../repo/instituteClass.repo.js';

class StudentService {
  
  createStudent = async (data) => {
    try {
      logger.info(`StudentService >>>> createStudent >>>> Processing creation for admissionNumber: ${data.admissionNumber}, instituteId: ${data.instituteId}`);
      
      // Validate required fields
      if (!data.userId || !data.instituteId || !data.admissionNumber) {
        throw new Error('Missing required fields: userId, instituteId, and admissionNumber are mandatory.');
      }

      // Check if user exists and has STUDENT role
      const user = await userRepo.getUserById(data.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== STUDENT) {
        throw new Error('User must have STUDENT role to create student record');
      }

      // Check institute match
      const userInstituteId = user.instituteId ? user.instituteId.toString() : null;
      const dataInstituteId = data.instituteId ? data.instituteId.toString() : null;
      
      if (userInstituteId && dataInstituteId && userInstituteId !== dataInstituteId) {
        throw new Error('User belongs to a different institute');
      }

      // Check if student record already exists
      const existingStudent = await studentRepo.getStudentsByUserId(data.userId);
      if (existingStudent) {
        throw new Error('Student record already exists for this user');
      }

      // Check if user already has a linked profile
      if (user.profileId) {
        throw new Error('Profile record already exists for this user');
      }

      const student = await studentRepo.createStudent(data);
      
      // Update User model and Class strength in parallel
      await Promise.all([
        userRepo.updateUserProfileId(data.userId, student._id),
        instituteClassRepo.updateStudentCount(data.instituteId, data.currentClassId, 1)
      ]);
      
      logger.info(`StudentService >>>> createStudent >>>> Student created successfully`, { 
        studentId: student._id, 
        admissionNumber: student.admissionNumber 
      });
      return student;
    } catch (error) {
      logger.error('StudentService >>>> createStudent >>>> Error creating student', {
        error: error.message,
        stack: error.stack,
        admissionNumber: data?.admissionNumber,
        instituteId: data?.instituteId
      });
      throw error;
    }
  };

  getStudentById = async (id) => {
    try {
      logger.info(`StudentService >>>> getStudentById >>>> Request for ID: ${id}`);
      const student = await studentRepo.getStudentById(id);
      
      if (!student) {
        logger.error('StudentService >>>> getStudentById >>>> Student not found', { studentId: id });
      } else {
        logger.info(`StudentService >>>> getStudentById >>>> Student fetched successfully`, { studentId: id });
      }
      
      return student;
    } catch (error) {
      logger.error('StudentService >>>> getStudentById >>>> Error fetching student', {
        error: error.message,
        stack: error.stack,
        studentId: id
      });
      throw error;
    }
  };

  getAllStudents = async (query) => {
    try {
      logger.info(`StudentService >>>> getAllStudents >>>> Fetching all students for institute: ${query.instituteId}`);
      
      // Institute ID is mandatory - users can only see their own institute's students
      if (!query.instituteId) {
        throw new Error('Institute ID is required to fetch students.');
      }

      const { students, total, page, limit } = await studentRepo.getAllStudents(query);
      
      logger.info(`StudentService >>>> getAllStudents >>>> Fetched ${students.length} students, total: ${total}`);
      return { students, total, page, limit };
    } catch (error) {
      logger.error('StudentService >>>> getAllStudents >>>> Error fetching all students', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  getStudentByUserId = async (userId) => {
    try {
      logger.info(`StudentService >>>> getStudentByUserId >>>> Fetching student for userId: ${userId}`);
      const student = await studentRepo.getStudentsByUserId(userId);
      
      if (!student) {
        logger.info(`StudentService >>>> getStudentByUserId >>>> No student found for userId: ${userId}`);
      } else {
        logger.info(`StudentService >>>> getStudentByUserId >>>> Student fetched successfully`, { userId, studentId: student._id });
      }
      
      return student;
    } catch (error) {
      logger.error('StudentService >>>> getStudentByUserId >>>> Error fetching student by userId', {
        error: error.message,
        stack: error.stack,
        userId
      });
      throw error;
    }
  };

  updateStudent = async (id, data) => {
    try {
      logger.info(`StudentService >>>> updateStudent >>>> Updating student: ${id}`);
      const student = await studentRepo.updateStudent(id, data);
      
      if (!student) {
        logger.error('StudentService >>>> updateStudent >>>> Student not found for update', { studentId: id });
        throw new Error('Student not found');
      }

      logger.info(`StudentService >>>> updateStudent >>>> Student updated successfully`, { studentId: student._id });
      return student;
    } catch (error) {
      logger.error('StudentService >>>> updateStudent >>>> Error updating student', {
        error: error.message,
        stack: error.stack,
        studentId: id,
        data
      });
      throw error;
    }
  };

  deleteStudent = async (id) => {
    try {
      logger.info(`StudentService >>>> deleteStudent >>>> Deleting student: ${id}`);
      const student = await studentRepo.deleteStudent(id);
      
      if (!student) {
        logger.error('StudentService >>>> deleteStudent >>>> Student not found for deletion', { studentId: id });
        throw new Error('Student not found');
      }

      // Update User model to mark that Student record has been removed
      if (student.userId) {
        await userRepo.updateUserProfileId(student.userId, null);
      }

      logger.info(`StudentService >>>> deleteStudent >>>> Student deleted successfully`, { studentId: id });
      return student;
    } catch (error) {
      logger.error('StudentService >>>> deleteStudent >>>> Error deleting student', {
        error: error.message,
        stack: error.stack,
        studentId: id
      });
      throw error;
    }
  };
}

export default new StudentService();

