// package require
const express = require("express");
const morgan = require("morgan");
const app = express();
var bodyParser = require("body-parser");

//
const { StatusCodes } = require("http-status-codes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// modules require
const { sequelize } = require("./models");
// PORT
const port = process.env.PORT || 3000;

// ROUTES
const userRoutes = require("./routes/userRoutes");
const userGroupRoutes = require("./routes/userGroupRoutes");
const questionRoutes = require("./routes/questionRoutes");
const lessionRoutes = require("./routes/lessionRoutes");
const videoBankRoutes = require("./routes/videoBankRoutes");
const comprehensiveRoutes = require("./routes/comprehensiveRoutes");
const quizRoutes = require("./routes/quizRoutes");
const resultRoutes = require("./routes/resultRoutes");
const practiceSetRoutes = require("./routes/practiceSetRoutes");
const examRoutes = require("./routes/examRoutes");
const homeWorkRoutes = require("./routes/homeWorkRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const groupRoutes = require("./routes/groupRoutes");
const bulkDataUploadRoutes = require("./routes/bulkDataUploadRoutes");
const statsRoutes = require("./routes/statsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const fileRoutes = require("./routes/fileRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const { scheduler } = require("timers/promises");

// Global middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
// parse application/json
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// console.log(__dirname + "../public");
app.use(express.static("public"));
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  // data sanitization
  app.use(xss());
  app.use(
    hpp({
      whitelist: ["role"],
    })
  );
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 100,
    message: "Too many request , please try again after 1 hours",
  });
  app.use("/api", limiter);
}
// Route Middleware (API routes )

app.use("/images", fileRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/user-group", userGroupRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/comprehensives", comprehensiveRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/practiceSets", practiceSetRoutes);
app.use("/api/v1", categoryRoutes, lessionRoutes, videoBankRoutes);
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/homeworks", homeWorkRoutes);
app.use("/api/v1/session", sessionRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/upload", bulkDataUploadRoutes);
app.use("/api/v1/stats", statsRoutes);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't found ${req.originalUrl} in this server`,
      StatusCodes.NOT_FOUND
    )
  );
});
app.use(globalErrorHandler);

app.listen(port, async () => {
  console.log("Server is running on port " + port);
  try {
    await sequelize.authenticate();
    console.log("Database Connected");
  } catch (err) {
    console.log("EORROR", err.message);
  }
});
