const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Op } = require("sequelize");
const {
  Quiz,
  QuizResult,
  Question,
  PracticeSetResult,
  PracticeSet,
  User,
  Exam,
  ExamResult,
} = require("./../models");
const { StatusCodes } = require("http-status-codes");
const sequelize = require("sequelize");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const totalQuiz = await Quiz.count();
  const totalQuestion = await Question.count();
  const totalPracticeSet = await PracticeSet.count();
  const totalStudents = await User.count({ where: { role: "student" } });
  const totalAdmin = await User.count({ where: { role: "admin" } });
  const totalInstructors = await User.count({ where: { role: "teacher" } });
  const totalExamSet = await Exam.count();
  // const paidStudents = await User.find({ where: { role: "student", paymentStatus: "paid" } })
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      totalQuiz,
      totalQuestion,
      totalPracticeSet,
      totalStudents,
      totalInstructors,
      totalExamSet,
      totalAdmin,
      // paidStudents
    },
  });
});
const getResults = async (Model, req, attribute) => {
  const results = await Model.findAll({
    where: { [attribute]: req.params.Id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "email"],
      },
    ],
    attributes: [
      [sequelize.fn("sum", sequelize.col("point")), "totalPoint"],
      [sequelize.fn("sum", sequelize.col("time_taken")), "totalTimeTaken"],
      [sequelize.fn("count", sequelize.col("remark")), "totalAnswer"],
    ],
    group: ["userId", "user.id", Model.name + ".id"],
    orderBy: [[sequelize.fn("sum", sequelize.col("point")), "DESC"]],
  });
  return results;
};

exports.getQuizResults = catchAsync(async (req, res, next) => {
  const quizResults = await getResults(QuizResult, req, "quizId");
  res.status(StatusCodes.OK).json({
    status: "success",
    data: quizResults,
  });
});
exports.getExamResults = catchAsync(async (req, res, next) => {
  const ExamResults = await getResults(ExamResult, req, "examId");
  res.status(StatusCodes.OK).json({
    status: "success",
    data: ExamResults,
  });
});
exports.getPracticeResults = catchAsync(async (req, res, next) => {
  const PracticeResults = await getResults(
    PracticeSetResult,
    req,
    "practiceSetId"
  );
  res.status(StatusCodes.OK).json({
    status: "success",
    data: PracticeResults,
  });
});
const groupByFn = (groupBy) => {
  const today = new Date();
  switch (groupBy) {
    case "year":
      return sequelize.fn("date_trunc", "year", sequelize.col("createdAt"));
    case "week":
      return sequelize.fn("date_trunc", "week", sequelize.col("createdAt"));
    case "month":
      return sequelize.fn("date_trunc", "month", sequelize.col("createdAt"));
    default:
      return sequelize.fn("date_trunc", "day", sequelize.col("createdAt"));
  }
};
exports.userRegistrationStats = catchAsync(async (req, res, next) => {
  let { groupBy, interval } = req.query;
  if (!interval) interval = "7 DAY";
  const users = await User.findAll({
    where: {
      createdAt: {
        [Op.gte]: sequelize.literal(`NOW() - INTERVAL '${interval}'`),
      },
    },
    attributes: [
      [groupByFn(groupBy), "date"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["date"],
    order: [[sequelize.literal("date"), "ASC"]],
  });
  const usersIncrease = users.map((count, index, arr) => {
    const currentCount = count.dataValues.count;
    const previousCount =
      index > 0 ? arr[index - 1].dataValues.count : currentCount;
    const increasePercentage =
      ((currentCount - previousCount) / previousCount) * 100;
    return {
      date: count.dataValues.date,
      count: currentCount,
      rateOfChange: increasePercentage,
    };
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      usersIncrease,
    },
  });
});
