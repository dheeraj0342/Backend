import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ErrorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/user.route.js";
import courseRouter from "./routes/course.route.js";

dotenv.config();

//cors
app.use(cors({ origin: process.env.ORIGIN }));

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//routes
app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Hello World",
  });
});

app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);

// unknown endpoint
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Not Found",
  });
});

app.use(ErrorMiddleware);
