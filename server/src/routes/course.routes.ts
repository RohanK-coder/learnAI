import { Router } from "express";
import {
  
  createCourse,
  enrollInCourse,
  getCourseSlides,
  getCourses,
  getLeaderboard,
  getMyCourses,
  viewSlide,
} from "../controllers/course.controller";
import { authorize, protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getCourses);
router.get("/my", protect, getMyCourses);

router.post("/", protect, authorize("professor", "admin"), createCourse);


router.post("/:courseId/enroll", protect, authorize("student"), enrollInCourse);
router.get("/:courseId/slides", protect, getCourseSlides);
router.post("/:courseId/slides/:slideId/view", protect, authorize("student"), viewSlide);
router.get("/:courseId/leaderboard", protect, getLeaderboard);

export default router;