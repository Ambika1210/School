import express from "express";
import TeacherDetailController from "../controllers/TeacherDetail.controller.js";
import { checkPermission } from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE teacher detail
router.post(
  "/v1/teacher-detail/create",
  checkPermission("CREATE_TEACHER_DETAIL"),
  TeacherDetailController.create
);

// GET all teacher details
router.get(
  "/v1/teacher-detail/get-all",
  checkPermission("GET_ALL_TEACHER_DETAILS"),
  TeacherDetailController.getAll
);

// GET teacher detail by ID
router.get(
  "/v1/teacher-detail/:id/get",
  checkPermission("GET_TEACHER_DETAIL_BY_ID"),
  TeacherDetailController.getById
);

// UPDATE teacher detail
router.patch(
  "/v1/teacher-detail/:id/update",
  checkPermission("UPDATE_TEACHER_DETAIL"),
  TeacherDetailController.update
);

// DELETE teacher detail
router.delete(
  "/v1/teacher-detail/:id/delete",
  checkPermission("DELETE_TEACHER_DETAIL"),
  TeacherDetailController.delete
);

export default router;
