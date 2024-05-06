class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
