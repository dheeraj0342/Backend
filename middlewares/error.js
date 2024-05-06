import ErrorHandler from "../utils/ErrorHandler.js";

export const ErrorMiddleware= (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // wrong mongoose object ID error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // jsonwebtoken error
  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Try again!!!";
    err = new ErrorHandler(message, 400);
  }

  // jsonwebtoken expired error
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired. Try again!!!";
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
