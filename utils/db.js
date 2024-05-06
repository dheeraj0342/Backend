import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        await (await mongoose.connect(process.env.DB_URL))
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.log(error);
    }
    }