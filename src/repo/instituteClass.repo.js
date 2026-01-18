import InstituteClass from '../models/instituteClass.model.js';
import logger from '../utils/logger.js';

class InstituteClassRepo {
    createClass = async (classData) => {
        try {
            logger.info(`InstituteClassRepo.js >>>> createClass() >>>> Creating class with name: ${classData.name}, section: ${classData.section}`);
            const newClass = new InstituteClass(classData);
            return await newClass.save();
        } catch (error) {
            logger.error('InstituteClassRepo >>>> createClass >>>> error', error);
            throw error;
        }
    };

    getClassById = async (classId) => {
        try {
            logger.info(`InstituteClassRepo >>>> getClassById >>>> Fetching class: ${classId}`);
            return await InstituteClass.findById(classId)
                .populate({
                    path: 'classTeacherId',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName email'
                    }
                }) 
                .populate('academicSessionId', 'name startDate endDate')
                .lean();
        } catch (error) {
            logger.error('InstituteClassRepo >>>> getClassById >>>> error', error);
            throw error;
        }
    };

    updateClass = async (classId, updateData) => {
        try {
            logger.info(`InstituteClassRepo.js >>>> updateClass() >>>> Updating class: ${classId}`);
            return await InstituteClass.findByIdAndUpdate(classId, updateData, { new: true }).lean();
        } catch (error) {
            logger.error('InstituteClassRepo >>>> updateClass >>>> error', error);
            throw error;
        }
    };

    deleteClass = async (classId) => {
        try {
             logger.info(`InstituteClassRepo.js >>>> deleteClass() >>>> Deleting class: ${classId}`);
            // Soft delete
            return await InstituteClass.findByIdAndUpdate(classId, { isDeleted: true }, { new: true }).lean();
        } catch (error) {
            logger.error('InstituteClassRepo.js >>>> deleteClass() >>>> error', error);
            throw error;
        }
    };

    getAllClasses = async (filter = {}, pagination = {}) => {
        try {
            logger.info(`InstituteClassRepo >>>> getAllClasses >>>> Fetching classes with filter: ${JSON.stringify(filter)}`);
            const { page = 1, limit = 10 } = pagination;
            const skip = (page - 1) * limit;

            const query = { ...filter, isDeleted: false };

            const classes = await InstituteClass.find(query)
                .populate({
                    path: 'classTeacherId',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName email'
                    }
                }) 
                .populate('academicSessionId', 'name')
                .skip(skip)
                .limit(limit)
                .sort({ name: 1, section: 1 }) 
                .lean();
            
            const total = await InstituteClass.countDocuments(query);

            logger.info(`InstituteClassRepo.js >>>> getAllClasses() >>>> Fetched ${classes.length} classes, total: ${total}`);
            return { classes, total, totalPages: Math.ceil(total / limit), currentPage: page };
        } catch (error) {
            logger.error('InstituteClassRepo >>>> getAllClasses >>>> error', error);
            throw error;
        }
    };

    checkClassExists = async (instituteId, academicSessionId, name, section) => {
        try {
            const existing = await InstituteClass.findOne({
                instituteId,
                academicSessionId,
                name,
                section,
                isDeleted: false
            });
            return !!existing;
        } catch (error) {
            logger.error('InstituteClassRepo.js >>>> checkClassExists() >>>> error', error);
            throw error;
        }
    }

    updateStudentCount = async (instituteId, classId, count) => {
        try {
            logger.info(`InstituteClassRepo.js >>>> updateStudentCount() >>>> Updating student count for class: ${classId}`);
            return await InstituteClass.findByIdAndUpdate(classId, { $inc: { strength: count } }, { new: true }).lean();
        } catch (error) {
            logger.error('InstituteClassRepo.js >>>> updateStudentCount() >>>> error', error);
            throw error;
        }
    }
}

export default new InstituteClassRepo();
