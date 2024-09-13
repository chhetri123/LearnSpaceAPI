const sequelize = require("sequelize");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Quiz, Question, User, QuizResult } = require("./../models");
const { StatusCodes } = require("http-status-codes");
// const { HomeWorkResultTable } = require("./../models/homeworkResultModel");
// const { PracticeSet } = require("./../models/practiceSetModel");
// const { ExamSet } = require("./../models/examModel");
// const { ExamResult } = require("./../models/examResultModel");
// const { PracticeResult } = require("./../models/practiceResultModel");

//

//
async function getDetailResult(Model, req, attribute) {
  const results = Model.findAll({
    where: { [attribute]: req.params.Id, userId: req.user.id },
    attributes: [
      "questionId",
      "point",
      "yourAnswer",
      "remark",
      "time_taken",
      "no_of_attempt",
      "skill",
      "section",
      "negativeMark",
    ],
  });
  return results;
}

// Find All Data of a Model
const findIds = async (Model, req, attributes) => {
  const data = await Model.findAll({
    where: { userId: req.user.id },
    attributes: [attributes],
    group: [attributes],
  });
  if (!data) return "Not Involved in this" + Model.name;
  return data.map((el) => el[attributes]);
};

// Get Aggregate of a Model
const getAggregate = async (Model, req, attributes) => {
  const results = await Model.findAll({
    where: { [attributes]: req.params.Id, userId: req.user.id },
    attributes: [
      [sequelize.fn("sum", sequelize.col("point")), "totalScoredPoint"],
      [sequelize.fn("sum", sequelize.col("time_taken")), "totalTimeTaken"],
      [sequelize.fn("avg", sequelize.col("point")), "avgScoredPoint"],
      [sequelize.fn("count", sequelize.col("remark")), "totalAnswer"],
      [sequelize.fn("sum", sequelize.col("negativeMark")), "totalNegativeMark"],
    ],
    group: ["userId", attributes],
  });

  const remarkCount = await Model.findAll({
    where: {
      [attributes]: req.params.Id,
      userId: req.user.id,
      remark: "correct",
    },
    attributes: [
      [sequelize.fn("count", sequelize.col("remark")), "correctAnswer"],
    ],
  });
  results[0].dataValues.correctAnswer =
    remarkCount[0].dataValues["correctAnswer"];
  return results;
};
// Users Involment in PracticeSet, Quiz, Exam
exports.getMyInvolvement = catchAsync(async (req, res, next) => {
  // const result_practiceset = await findIds(
  //   PracticeResult,
  //   req,
  //   "practiceSetId"
  // );
  const result_quiz = await findIds(QuizResult, req, "quizId");
  // const result_exam = await findIds(ExamResult, req, "examId");
  res.status(200).json({
    status: "success",

    myInvolvement: {
      // practiceSet: result_practiceset,
      quiz: result_quiz,
      // exam: result_exam,
    },
  });
});

// Get Result of a Quiz

exports.getMyQuizResult = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findOne({
    where: { id: req.params.Id },
  });
  if (!quiz) return next(new AppError("No Quiz Found", StatusCodes.NOT_FOUND));
  const results = await getAggregate(QuizResult, req, "quizId");
  results[0].dataValues.isTimeBound = quiz.isTimeBound;
  results[0].dataValues.durationOfQuiz = quiz.duration;
  results[0].dataValues.totalPercentage = Math.round(
    (+results[0].dataValues.totalScoredPoint / quiz.totalMarks) * 100
  );
  results[0].dataValues.totalQuizPoint = quiz.totalMarks;
  results[0].dataValues.totalSkippedQuestion =
    quiz.totalQuestion - +results[0].dataValues.totalAnswer;
  const detailResult = await getDetailResult(QuizResult, req, "quizId");
  res.status(200).json({
    status: "success",
    results,
    questionsAttempts: detailResult,
  });
});

exports.getMyPracticeSetResult = catchAsync(async (req, res, next) => {
  const quiz = await PracticeSet.findByPk(req.params.Id);
  if (!quiz)
    return next(new AppError("No PracticeSet Found", StatusCodes.NOT_FOUND));
  const results = await getAggregate(PracticeResult, req, "practiceSetId");
  const detailResult = await getDetailResult(
    PracticeResult,
    req,
    "practiceSetId"
  );
  res.status(200).json({
    status: "success",
    results,
    questionsAttempts: detailResult,
  });
});
exports.getMyExamResult = catchAsync(async (req, res, next) => {
  const quiz = await ExamSet.findByPk(req.params.Id);
  if (!quiz)
    return next(new AppError("No Exxam Set Found", StatusCodes.NOT_FOUND));
  const results = await getAggregate(ExamResult, req, "examId");
  const detailResult = await getDetailResult(ExamResult, req, "examId");

  res.status(200).json({
    status: "success",
    results,
    questionsAttempts: detailResult,
  });
});
exports.getMyHomeWorkResult = catchAsync(async (req, res, next) => {
  const homeWork = await HomeWorkResultTable.findOne({
    where: { userId: req.user.id },
    attributes: ["homeworkId", "yourAnswer"],
  });
  if (!homeWork)
    return next(new AppError("No HomeWork Found", StatusCodes.NOT_FOUND));
  const homeworkPoints = await HomeWorkResultTable.findOne({
    where: { userId: req.user.id },
    attributes: [
      [sequelize.fn("sum", sequelize.col("point")), "totalPoint"],
      [sequelize.fn("count", sequelize.col("homeworkId")), "TotalHomeworkDone"],
    ],
  });
  res.status(200).json({
    status: "success",
    results: {
      totalData: homeworkPoints.dataValues,
      homeWorkDetails: homeWork,
    },
  });
});
