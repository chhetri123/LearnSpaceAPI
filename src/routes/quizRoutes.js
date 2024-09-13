const express = require("express");
const auth = require("../middlewares/auth");
const quizController = require("./../controllers/quizController");
const sessionController = require("./../controllers/sessionController");
const router = express.Router();
router.use(auth.protect);

// quiz Category

//Quiz Type
router
  .route("/quiztypes")
  .get(quizController.getQuizType)
  .post(quizController.addQuizType);
// quiz
router
  .route("/")
  .get(quizController.getAllQuiz)
  .post(auth.restrictTo("admin", "teacher"), quizController.createQuiz);

// student can only start quiz and submit quiz
router.route("/:Id/startQuiz").get(quizController.getQuestionsOfQuiz);
router
  .route("/:Id/submitQuiz")
  .post(auth.restrictTo("student"), quizController.checkQuizAnswer);
router.route("/:Id").get(quizController.getQuiz);

// only admin and teacher can update and delete quiz
router.use(auth.restrictTo("admin", "teacher"));

// quiz category

router
  .route("/quiztypes/:Id")
  .delete(quizController.deleteQuizType)
  .patch(quizController.updateQuizType);
// quiz session
router.route("/:Id/session").post(sessionController.createSessionOnQuiz);

// quiz
router
  .route("/:Id")
  .patch(quizController.updateQuiz)
  .delete(quizController.deleteQuiz);
router.route("/:Id/addQuestions").post(quizController.addQuestion);
router.route("/:Id/questions").get(quizController.getQuestionsOfQuiz);

// router.use(questionRoutes);

module.exports = router;
