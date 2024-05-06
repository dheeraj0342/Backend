import express from "express";
const router = express.Router();
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";
import { uploadCourse ,editCourse,getSingleCourse,getAllCourses,getCourseContent} from "../controllers/course.controller.js";

router.post("/create-course",isAuthenticated,authorizeRoles("admin"), uploadCourse);
router.post("/edit-course/:id",isAuthenticated,authorizeRoles("admin"), editCourse);
router.get("/get-course/:id", getSingleCourse);
router.get("/get-courses", getAllCourses);
router.get("/get-course-content/:id", getCourseContent);
export default router;