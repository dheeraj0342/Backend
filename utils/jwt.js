import dotenv from "dotenv";
import {redis} from './redis.js'

dotenv.config();

const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE_TIME || '300',10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE_TIME || '1200',10);

export const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60* 60 * 1000),
    httpOnly: true,
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    sameSite:'lax'
};
export const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24  * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: refreshTokenExpire * 24  * 60 * 60 * 1000,
    sameSite:'lax'
};
export const sendToken = (res,stausCode, user) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    //set session to redis
    redis.set(user._id, JSON.stringify(user));

   
    if(process.env.NODE_ENV === 'production'){
        accessTokenOptions.secure = true;   
    }

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);
    res.status(stausCode).json({
        success: true,
        accessToken,
        user
    });
}


