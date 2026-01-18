import TeacherDetailService from  '../services/teacherDetail.service.js';
import logger from "../utils/logger.js";

class TeacherDetailController {
  create = async (req, res) => {
    try {
      const data = await TeacherDetailService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      logger.error(error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const data = await TeacherDetailService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getAll = async (req, res) => {
    const result = await TeacherDetailService.getAll(req.query);
    res.json({ success: true, ...result });
  };

  update = async (req, res) => {
    try {
      const data = await TeacherDetailService.update(
        req.params.id,
        req.body
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  delete = async (req, res) => {
    await TeacherDetailService.delete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  };
}

export default new TeacherDetailController();
