import Course from "../models/course.model.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";

// create course
export const createCourse = catchAsyncError(async (data, res) => {
    const newCourse = await Course.create(data);
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
})

