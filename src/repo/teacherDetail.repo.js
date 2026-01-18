import Teacher from '../models/teacherDetail.model.js';
import logger from "../utils/logger.js";
import mongoose from "mongoose";

class TeacherDetailRepository {
  create = async (data) => {
    try {
      logger.info("TeacherDetailRepo << create");
      const result = await TeacherDetail.create(data);
      return result;
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  };

  getById = async (id) => {
    return TeacherDetail.findOne({ _id: id, isDeleted: false })
      .populate("userId", "name email")
      .lean();
  };

  getByUserId = async (userId) => {
    return TeacherDetail.findOne({ userId, isDeleted: false }).lean();
  };

  getAll = async (filter, options) => {
    return TeacherDetail.find({ isDeleted: false, ...filter })
      .skip(options.skip)
      .limit(options.limit)
      .lean();
  };

  update = async (id, data) => {
    return TeacherDetail.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      { new: true }
    ).lean();
  };

  delete = async (id) => {
    return TeacherDetail.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );
  };
}

export default new TeacherDetailRepository();
