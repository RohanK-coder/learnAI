import { Router } from "express";
import {
  enrollInCourse,
  getCourseSlides,
  getCourses,
  getLeaderboard,
  getMyCourses,
  viewSlide,
} from "../controllers/course.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getCourses);
router.get("/my", protect, getMyCourses);
router.post("/:courseId/enroll", protect, enrollInCourse);
router.get("/:courseId/slides", protect, getCourseSlides);
router.post("/:courseId/slides/:slideId/view", protect, viewSlide);
router.get("/:courseId/leaderboard", protect, getLeaderboard);

export default router;