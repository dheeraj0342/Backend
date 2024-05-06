import { catchAsyncError } from "./catchAsyncError.js";
import {redis} from "../utils/redis.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncError(async(req, res, next) => {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
        req.user = decoded;
        if(!decoded){
            return next(new ErrorHandler("access Token is not valid", 401));
        }

        const user = await redis.get(decoded.id);
        if(!user){
            return next(new ErrorHandler("User not found", 404));
        }

        req.user = JSON.parse(user);
        next();   
     
})  

// validate user role
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role (${req.user?.role}) is not allowed to access this resource`, 403));
        }
        next();
    }
}
