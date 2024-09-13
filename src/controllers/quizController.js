const {
  Quiz,
  Question,
  QuizSetQuestion,
  QuizResult,
  QuizType,
} = require("./../models");
const {
  getOne,
  createOne,
  updateOne,
  getAll,
  getQuestionOfModels,
  addQuestionToModel,
  checkAnswer,
  deleteOne,
} = require("./handlerController");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// category

// QUiz Types
exports.getQuizType = getAll(QuizType);
exports.addQuizType = createOne(QuizType);
exports.updateQuizType = updateOne(QuizType);
exports.deleteQuizType = deleteOne(QuizType);
// Quiz
exports.getAllQuiz = getAll(Quiz);
exports.createQuiz = createOne(Quiz);
exports.updateQuiz = updateOne(Quiz);
exports.getQuiz = getOne(Quiz);
exports.getQuestionsOfQuiz = getQuestionOfModels(QuizSetQuestion, "quizId");
exports.deleteQuiz = deleteOne(Quiz);

exports.addQuestion = addQuestionToModel(Quiz);
exports.checkQuizAnswer = checkAnswer(Quiz, QuizResult, Question, "quizId");

// exports.checkQuizAnswer = catchAsync(async (req, res, next) => {
//   const { totalTime, answerGiven } = req.body;
//   await answerGiven.forEach(async (answered) => {
//     const questionId = answered.questionId;
//     const quiz = await Quiz.findOne({ where: { id: req.params.Id } });
//     const question = await Question.findOne({ where: { id: questionId } });
//     const isCorrect = await question.checkAnswer(
//       answered.answers,
//       question.correct_answers
//     );
//     let negativeMark = 0;
//     if (!isCorrect && quiz.isNegativeMark) {
//       quiz.point = quiz.point - quiz.negativeMark;
//       negativeMark = quiz.negativeMark;
//     }
//     const alreadyAnswered = await QuizResult.findOne({
//       where: {
//         userId: req.user.id,
//         questionId,
//         quizId: req.params.Id,
//       },
//     });
//     if (!quiz.isTimeBound) {
//       totalTime = 0;
//     }
//     if (alreadyAnswered) {
//       await QuizResult.update(
//         {
//           remark: isCorrect,
//           yourAnswer: answered.answers,
//           point: quiz.point,
//           time_taken: +totalTime / answerGiven.length,
//           no_of_attempt: alreadyAnswered.no_of_attempt + 1,
//           negativeMark,
//         },
//         { where: { id: alreadyAnswered.id } }
//       );
//     } else {
//       await QuizResult.create({
//         userId: req.user.id,
//         quizId: req.params.Id,
//         questionId,
//         yourAnswer: answered.answers,
//         section: question.section,
//         skill: question.skill,
//         remark: isCorrect,
//         point: quiz.point,
//         negativeMark,
//         time_taken: +totalTime / answerGiven.length,
//       });
//     }
//   });
//   res.status(StatusCodes.OK).json({
//     status: "success",
//     message: `Your ${answerGiven.length} Answer submitted successfully`,
//   });
// });
