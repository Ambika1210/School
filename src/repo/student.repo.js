import Student from '../models/student.model.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

class StudentRepo {
  
  createStudent = async (data) => {
    try {
      logger.info(`StudentRepo >>>> createStudent >>>> Creating student with admissionNumber: ${data.admissionNumber}, instituteId: ${data.instituteId}`);
      const student = await Student.create(data);
      
      logger.info(`StudentRepo >>>> createStudent >>>> Student created successfully`, { 
        studentId: student._id, 
        admissionNumber: student.admissionNumber 
      });
      return student;
    } catch (error) {
      logger.error(`StudentRepo >>>> createStudent >>>> Error creating student: ${error.message}`, {
        stack: error.stack,
        admissionNumber: data?.admissionNumber
      });
      throw error;
    }
  };

  getStudentById = async (id) => {
    try {
      logger.info(`StudentRepo >>>> getStudentById >>>> Fetching student: ${id}`);
      const studentId = new mongoose.Types.ObjectId(id);
      const student = await Student.findOne(studentId)
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl')
        .populate('instituteId', 'name code')
        // .populate('academicSessionId', 'name startDate endDate isCurrent')
        .populate('parentIds', 'firstName lastName email phoneNo countryCode')
        .populate('currentClassId', 'name section')
        .lean();
      
      if (!student) {
        logger.error('StudentRepo >>>> getStudentById >>>> Student not found', { studentId: id });
        return null;
      }
      
      logger.info(`StudentRepo >>>> getStudentById >>>> Student fetched successfully`, { studentId: id });
      return student;
    } catch (error) {
      logger.error('StudentRepo >>>> getStudentById >>>> Error fetching student', {
        error: error.message,
        stack: error.stack,
        studentId: id
      });
      throw error;
    }
  };

  getAllStudents = async (query) => {
    try {
      logger.info(`StudentRepo >>>> getAllStudents >>>> Fetching students with query:`, query);
      
      const {
        instituteId,
        class: studentClass,
        section,
        academicSessionId,
        isActive,
        isDeleted,
        page = 1,
        limit = 10
      } = query;

      // Build filter object
      const filter = {};
      
      // Institute ID is mandatory - users can only see their own institute's students
      if (instituteId) {
        filter.instituteId = new mongoose.Types.ObjectId(instituteId);
      }

      // Optional filters
      if (studentClass) {
        filter.class = studentClass;
      }
      if (section) {
        filter.section = section;
      }
      if (academicSessionId) {
        filter.academicSessionId = new mongoose.Types.ObjectId(academicSessionId);
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === true || isActive === 'true';
      }
      if (isDeleted !== undefined) {
        filter.isDeleted = isDeleted === true || isDeleted === 'true';
      } else {
        // By default, exclude deleted students
        filter.isDeleted = false;
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);

      // Get total count
      const total = await Student.countDocuments(filter);

      // Fetch students with pagination and populate
      const students = await Student.find(filter)
        .populate('userId', 'firstName lastName email phoneNo countryCode isActive createdAt')
        // .populate('instituteId', 'name code')
        // .populate('academicSessionId', 'name startDate endDate isCurrent')
        // .populate('parentIds', 'firstName lastName email phoneNo countryCode')
        .populate('currentClassId', 'name section')
        .select('admissionNumber rollNumber userId currentClassId isActive createdAt')
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limitNum)
        .lean();

      logger.info(`StudentRepo >>>> getAllStudents >>>> Fetched ${students.length} students, total: ${total}`);
      return { students, total, page: parseInt(page), limit: limitNum };
    } catch (error) {
      logger.error('StudentRepo >>>> getAllStudents >>>> Error fetching students', {
        error: error.message,
        stack: error.stack,
        query
      });
      throw error;
    }
  };

  getStudentsByUserId = async (userId) => {
    try {
      logger.info(`StudentRepo >>>> getStudentsByUserId >>>> Fetching student for userId: ${userId}`);
      const student = await Student.findOne({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl')
        .populate('instituteId', 'name code')
        // .populate('academicSessionId', 'name startDate endDate isCurrent')
        .populate('parentIds', 'firstName lastName email phoneNo countryCode')
        .populate('currentClassId', 'name section')
        .lean();
      
      if (student) {
        logger.info(`StudentRepo >>>> getStudentsByUserId >>>> Student found for userId: ${userId}`);
      } else {
        logger.info(`StudentRepo >>>> getStudentsByUserId >>>> No student found for userId: ${userId}`);
      }
      
      return student;
    } catch (error) {
      logger.error('StudentRepo >>>> getStudentsByUserId >>>> Error fetching student by userId', {
        error: error.message,
        stack: error.stack,
        userId
      });
      throw error;
    }
  };

  updateStudent = async (id, data) => {
    try {
      logger.info(`StudentRepo >>>> updateStudent >>>> Updating student: ${id}`);
      const studentId = new mongoose.Types.ObjectId(id);
      const student = await Student.findByIdAndUpdate(
        studentId,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl')
        .populate('instituteId', 'name code')
        // .populate('academicSessionId', 'name startDate endDate isCurrent')
        .populate('parentIds', 'firstName lastName email phoneNo countryCode')
        .populate('currentClassId', 'name section')
        .lean();
      
      if (!student) {
        logger.error('StudentRepo >>>> updateStudent >>>> Student not found for update', { studentId: id });
        return null;
      }
      
      logger.info(`StudentRepo >>>> updateStudent >>>> Student updated successfully`, { studentId: id });
      return student;
    } catch (error) {
      logger.error('StudentRepo >>>> updateStudent >>>> Error updating student', {
        error: error.message,
        stack: error.stack,
        studentId: id
      });
      throw error;
    }
  };

  deleteStudent = async (id) => {
    try {
      logger.info(`StudentRepo >>>> deleteStudent >>>> Soft deleting student: ${id}`);
      const studentId = new mongoose.Types.ObjectId(id);
      const student = await Student.findByIdAndUpdate(
        studentId,
        { $set: { isDeleted: true } },
        { new: true }
      )
        .populate('userId', 'firstName lastName email phoneNo countryCode gender dob address profileUrl')
        .populate('instituteId', 'name code')
        // .populate('academicSessionId', 'name startDate endDate isCurrent')
        .populate('parentIds', 'firstName lastName email phoneNo countryCode')
        .lean();
      
      if (!student) {
        logger.error('StudentRepo >>>> deleteStudent >>>> Student not found for deletion', { studentId: id });
        return null;
      }
      
      logger.info(`StudentRepo >>>> deleteStudent >>>> Student deleted successfully`, { studentId: id });
      return student;
    } catch (error) {
      logger.error('StudentRepo >>>> deleteStudent >>>> Error deleting student', {
        error: error.message,
        stack: error.stack,
        studentId: id
      });
      throw error;
    }
  };
}

export default new StudentRepo();

