import User from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import ejs from "ejs";
import jwt from "jsonwebtoken";
import path from "path";
import sendMail from "../utils/sendMail.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {redis} from "../utils/redis.js";
import {accessTokenOptions,refreshTokenOptions,sendToken } from "../utils/jwt.js";
import { get } from "http";
import { getUserById } from "../services/user.service.js";
import cloudinary from "cloudinary"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const registerUser = catchAsyncError(async (req, res, next) => {
   try {
    const { name, email, password } = req.body;
    const isEmailExists = await User.findOne({ email});
    if (isEmailExists) {
        return next(new ErrorHandler("Email already exists", 400));
    }
    const user = {
        name,
        email,
        password,
    };

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const data = {user:{name:user.name},activationCode}

    const html = await ejs.renderFile(path.join(__dirname, "../mail/activation-mail.ejs"), data);

    try {
        await sendMail({
            email: user.email,
            subject: "Account Activation",
            template: "activation-mail.ejs",
            data,
        });
        res.status(201).json({
            success: true,
            message: "Account activation email sent successfully",
            activationToken : activationToken.token
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }

    }
    catch (error) {
     return next(new ErrorHandler(error.message, 400));
   };
});

export const createActivationToken = (payload) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ payload, activationCode }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
    return { token, activationCode };
}


export const activateAccount = catchAsyncError(async (req, res, next) => {
    try {
        const {activationCode , activationToken} = req.body;
        const newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
        if (newUser.activationCode !== activationCode) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.payload;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ErrorHandler("Email already exists", 400));
        }
        const user = await User.create({
            name,
            email,
            password,
        });
        res.status(201).json({
            success: true,
            message: "Account activated successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

export const loginUser = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        sendToken(res, 200, user);
        
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
    }
});

export const logoutUser = catchAsyncError(async (req, res, next) => {
    try {
        res.clearCookie("access_token","",{maxAge:1});
        res.clearCookie("refresh_token","",{maxAge:1});
        const userId = req.user?._id || '';
        redis.del(userId);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
}); 

export const updateAccessToken = catchAsyncError(async (req, res, next) => {
    try{
        const refresh_token = req.cookies.refresh_token
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET);
        if(!decoded){
            return next(new ErrorHandler("Invalid refresh token", 400));
        }
        const session = await redis.get(decoded.id);
        if(!session){
            return next(new ErrorHandler("Invalid refresh token", 400));
        }
        const user = JSON.parse(session);

        const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_SECRET, {expiresIn: "5m"});
        const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_SECRET, {expiresIn: "3d"});

        req.user = user;

        res.cookie("access_token", accessToken,accessTokenOptions);
        res.cookie("refresh_token", refreshToken,refreshTokenOptions);

    }catch(error){
        return next(new ErrorHandler(error.message, 400));
    }
});


export const getUserInfo = catchAsyncError(async (req, res, next) => {
    try{

        const userId = req.user?._id;
        getUserById(userId,res);
    }catch(error){
            return next(new ErrorHandler(error.message, 400));
    }

})

// social auth
export const socialAuth = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, avatar } = req.user;
        const user = await User.findOne({ email});
        if(!user){
            const user = await User.create({
                name,
                email,
                avatar,
            });
            sendToken(res, 200, user);
        }
        else{
            sendToken(res, 200, user);
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// update user info
export const updateUserInfo = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?._id;
        const user = await User.findById(userId);
        if(email && user){
            const isEmailExists = await User.findOne({ email });
            if(isEmailExists){
                return next(new ErrorHandler("Email already exists", 400));
            }
            user.email = email;
        }
        if(name && user){
            user.name = name;
        }

        await user.save();
        await redis.set(userId, JSON.stringify(user));

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// update password
export const updatePassword = catchAsyncError(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id).select("+password");
        if(!oldPassword || !newPassword){
            return next(new ErrorHandler("Please enter old password and new password", 400));
        }

        if(user.password === undefined){
            return next(new ErrorHandler("Invalid user", 400));
        }

        const isPasswordMatched = await user.comparePassword(oldPassword);
        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid password", 400));
        }
        user.password = newPassword;
        await user.save();
        await redis.set(user._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// update profile picture
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
    try {
        const {avatar} = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(avatar && user){
            if(user?.avatar?.public_id){
                await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            }
                const myCloud = await cloudinary.v2.uploader.upload(avatar,{
                    folder: "avatars",
                    width: 150,
                });
                user.avatar ={
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                
                }
            
        }
        await user.save();
        await redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
})




