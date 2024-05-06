import express from "express";
import { registerUser ,activateAccount,loginUser,logoutUser, updateAccessToken, getUserInfo,socialAuth,updateUserInfo,updatePassword,updateProfilePicture} from "../controllers/user.controller.js";
const router = express.Router();
import { isAuthenticated } from "../middlewares/auth.js";

router.post("/register", registerUser);
router.post("/activation", activateAccount);
router.post("/login",loginUser);
router.get("/logout", isAuthenticated, logoutUser);
router.get('/refreshtoken',updateAccessToken)
router.get('/me',isAuthenticated,getUserInfo)
router.post('/social-auth',socialAuth)
router.put('/update-user-info',isAuthenticated,updateUserInfo)
router.put('/update-user-password',isAuthenticated,updatePassword)
router.put('/update-user-profile',isAuthenticated,updateProfilePicture)

export default router;                          
