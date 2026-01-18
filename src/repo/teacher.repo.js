import Teacher from '../models/teacher.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

class TeacherRepo {
  
  createTeacher = async (data) => {
    try {
      logger.info(`TeacherRepo >>>> createTeacher >>>> Creating teacher with userId: ${data.userId}, instituteId: ${data.instituteId}`);
      const teacher = await Teacher.create(data);
      
      logger.info(`TeacherRepo >>>> createTeacher >>>> Teacher created successfully`, { 
        teacherId: teacher._id,
        userId: teacher.userId
      });
      return teacher;
    } catch (error) {
      logger.error(`TeacherRepo >>>> createTeacher >>>> Error creating teacher: ${error.message}`, {
        stack: error.stack,
        userId: data?.userId
      });
      throw error;
    }
  };

  getTeacherById = async (id) => {
    try {
      logger.info(`TeacherRepo >>>> getTeacherById >>>> Fetching teacher: ${id}`);
      const teacherId = new mongoose.Types.ObjectId(id);
      const teacher = await Teacher.findById(teacherId)
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl role')
        .populate('instituteId', 'name code')
        .lean();
      
      if (!teacher) {
        logger.error(`TeacherRepo >>>> getTeacherById >>>> Teacher not found for id: ${id}`, { teacherId: id });
        return null;
      }
      
      logger.info(`TeacherRepo >>>> getTeacherById >>>> Teacher fetched successfully`, { teacherId: id });
      return teacher;
    } catch (error) {
      logger.error(`TeacherRepo >>>> getTeacherById >>>> Error fetching teacher: ${error.message}`, {
        stack: error.stack,
        teacherId: id
      });
      throw error;
    }
  };

  getAllTeachers = async (query) => {
    try {
      logger.info(`TeacherRepo >>>> getAllTeachers >>>> Fetching teachers with query: ${JSON.stringify(query)}`);
      
      const {
        instituteId,
        designation,
        department,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = query;

      const filter = {};
      
      if (instituteId) {
        filter.instituteId = new mongoose.Types.ObjectId(instituteId);
      }
      if (designation) {
        filter.designation = designation;
      }
      if (department) {
        filter.department = department;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === true || isActive === 'true';
      }
      if (isDeleted !== undefined) {
        filter.isDeleted = isDeleted === true || isDeleted === 'true';
      } else {
        filter.isDeleted = false;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      const total = await Teacher.countDocuments(filter);

      const teachers = await Teacher.find(filter)
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl role')
        .populate('instituteId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      logger.info(`TeacherRepo >>>> getAllTeachers >>>> Fetched ${teachers.length} teachers, total: ${total}`);
      return { teachers, total, page: parseInt(page), limit: limitNum };
    } catch (error) {
      logger.error(`TeacherRepo >>>> getAllTeachers >>>> Error fetching teachers: ${error.message}`, {
        stack: error.stack,
        query
      });
      throw error;
    }
  };
}

export default new TeacherRepo();
