const { StatusCodes } = require("http-status-codes");
const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.message.match(/"[^\"]*"/);
  const message = `Duplicate field value : ${value} Please use another value`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data : ${value.join(" ,")}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};
const hanldleConstantError = (err) => {
  const pattern = /"([^"]*)"/;
  const match = err.parent.detail.match(pattern);
  const message = `${match[1]} not found `;

  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const hanldleDatabaseError = (err) => {
  const message = `Database Error : ${err.message}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};
const handleInvalidJWT = () =>
  new AppError(`Invalid Token.`, StatusCodes.BAD_REQUEST);

const handleJWTExpire = () =>
  new AppError("Token Expired! Please login again", StatusCodes.BAD_REQUEST);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //  Render Website
  return res.status(err.statusCode).json({
    status: "error",
    title: "Something went wrong",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      msg: err.message,
    });
  }
  return res.status(err.statusCode).json({
    status: "error",
    title: "Something went wrong",
    msg: "Please Try again later.",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;

    // error coming from monoose
    console.log(error.code);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleInvalidJWT();
    if (error.name === "TokenExpiredError") error = handleJWTExpire();
    if (error.name === "SequelizeValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "SequelizeForeignKeyConstraintError")
      error = hanldleConstantError(error);
    if (error.name === "SequelizeDatabaseError")
      error = hanldleDatabaseError(error);
    if (error.code === "NoSuchKey")
      error = new AppError("No Such File Found", StatusCodes.NOT_FOUND);

    sendErrorProd(error, req, res);
  }
};
