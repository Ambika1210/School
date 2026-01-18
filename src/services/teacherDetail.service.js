import TeacherDetailRepository from '../repo/teacherDetail.repo.js';
import logger from "../utils/logger.js";

class TeacherDetailService {
  create = async (data) => {
    logger.info("TeacherDetailService << create");

    const exists = await TeacherDetailRepository.getByUserId(data.userId);
    if (exists) throw new Error("Teacher detail already exists");

    return TeacherDetailRepository.create(data);
  };

  getById = async (id) => {
    const data = await TeacherDetailRepository.getById(id);
    if (!data) throw new Error("Teacher detail not found");
    return data;
  };

  getAll = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await TeacherDetailRepository.getAll({}, { skip, limit });

    return { page, limit, count: data.length, data };
  };

  update = async (id, body) => {
    const updated = await TeacherDetailRepository.update(id, body);
    if (!updated) throw new Error("Teacher detail not found");
    return updated;
  };

  delete = async (id) => {
    return TeacherDetailRepository.delete(id);
  };
}

export default new TeacherDetailService();
