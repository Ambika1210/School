import classRepo from '../repo/instituteClass.repo.js';
import logger from '../utils/logger.js';

class InstituteClassService {

    createClass = async (classData) => {
        try {
            logger.info(`InstituteClassService >>>> createClass >>>> Creating class with Name: ${classData.name}, Section: ${classData.section}`);
            
            // Validate duplicates
            const exists = await classRepo.checkClassExists(
                classData.instituteId,
                classData.academicSessionId,
                classData.name,
                classData.section
            );

            if (exists) {
                throw new Error('Class with this Name and Section already exists for the current session.');
            }

            const newClass = await classRepo.createClass(classData);
            logger.info(`InstituteClassService >>>> createClass >>>> Class created successfully: ${newClass._id}`);
            return newClass;
        } catch (error) {
            logger.error(`InstituteClassService >>>> createClass >>>> Error: ${error.message}`, { error });
            throw error;
        }
    };

    getAllClasses = async (filter, pagination) => {
        try {
            logger.info(`InstituteClassService >>>> getAllClasses >>>> Fetching classes with filter: ${JSON.stringify(filter)}`);
            const result = await classRepo.getAllClasses(filter, pagination);
            logger.info(`InstituteClassService >>>> getAllClasses >>>> Fetched ${result.classes.length} classes`);
            return result;
        } catch (error) {
            logger.error(`InstituteClassService >>>> getAllClasses >>>> Error: ${error.message}`, { error });
            throw error;
        }
    };

    getClassById = async (classId) => {
        try {
            logger.info(`InstituteClassService >>>> getClassById >>>> Fetching class: ${classId}`);
            const classData = await classRepo.getClassById(classId);
            
            if (!classData) {
                throw new Error('Class not found');
            }
            
            logger.info(`InstituteClassService >>>> getClassById >>>> Class fetched successfully: ${classId}`);
            return classData;
        } catch (error) {
            logger.error(`InstituteClassService >>>> getClassById >>>> Error: ${error.message}`, { error });
            throw error;
        }
    };

    updateClass = async (classId, updateData) => {
        try {
            logger.info(`InstituteClassService >>>> updateClass >>>> Updating class: ${classId}`);
            
            // Check if class exists
            const existingClass = await classRepo.getClassById(classId);
            if (!existingClass) {
                throw new Error('Class not found');
            }
            
            if (updateData.name || updateData.section) {
                const { name, section, academicSessionId, instituteId } = existingClass;
                
                const newName = updateData.name || name;
                const newSection = updateData.section || section;
                const sessionId = academicSessionId?._id || academicSessionId;

                if (newName !== name || newSection !== section) {
                    const isDuplicate = await classRepo.checkClassExists(instituteId, sessionId, newName, newSection);
                    if (isDuplicate) throw new Error('Class with this Name and Section already exists.');
                }
            }

            const updatedClass = await classRepo.updateClass(classId, updateData);
            logger.info(`InstituteClassService >>>> updateClass >>>> Class updated successfully: ${classId}`);
            return updatedClass;
        } catch (error) {
            logger.error(`InstituteClassService >>>> updateClass >>>> Error: ${error.message}`, { error });
            throw error;
        }
    };

    deleteClass = async (classId) => {
        try {
            logger.info(`InstituteClassService >>>> deleteClass >>>> Deleting class: ${classId}`);
            const deleted = await classRepo.deleteClass(classId);
            
            if (!deleted) {
                throw new Error('Class not found');
            }
            
            logger.info(`InstituteClassService >>>> deleteClass >>>> Class deleted successfully: ${classId}`);
            return deleted;
        } catch (error) {
            logger.error(`InstituteClassService >>>> deleteClass >>>> Error: ${error.message}`, { error });
            throw error;
        }
    };
}

export default new InstituteClassService();
