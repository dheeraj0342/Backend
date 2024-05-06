import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { createCourse } from "../services/course.service.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import Course from "../models/course.model.js";
import { redis } from "../utils/redis.js";
// upload course 
export const uploadCourse = catchAsyncError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if(thumbnail){
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };       
    }
    createCourse(data, res);

    res.status(201).json({
      success: true,
      message: "Course uploaded successfully",
      data: newCourse,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// edit course
export const editCourse = catchAsyncError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;
    if(thumbnail){
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "courses",
        });
        data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };

        const courseId = req.params.id;
        const course = await Course.findByIdAndUpdate(courseId, data, {$set: data}, {new: true});
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: course,
        });

    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get single course
export const getSingleCourse = catchAsyncError(async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const isCachedExist = await redis.get(courseId);
    if(isCachedExist){
        const course = JSON.parse(isCachedExist);
        return res.status(200).json({
            success: true,
            data: course,
        });
      }else{

    const course = await Course.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
    if(!course){
        return next(new ErrorHandler("Course not found", 404));
    }
    await redis.set(courseId, JSON.stringify(course));
    res.status(200).json({
        success: true,
        data: course,
    });
  }
} catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
})

// get all courses
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  try {
    const isCachedExist = await redis.get("allcourses");
    if(isCachedExist){
        const courses = JSON.parse(isCachedExist);
        return res.status(200).json({
            success: true,
            data: courses,
        });
    }else{
      const courses = await Course.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
      await redis.set("allcourses", JSON.stringify(courses));
      res.status(200).json({
        success: true,
        data: courses,
      });
    }
   
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get course content for valid user
export const getCourseContent = catchAsyncError(async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userCourseList = req.user.courses;

    const courseExist = userCourseList.find((c) => c.courseId === courseId);
    if(!courseExist){
        return next(new ErrorHandler("Course not found", 404));
    }
    const course = await Course.findById(courseId);
    const content = course.courseData;
    res.status(200).json({
      success: true,
        content,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
})
