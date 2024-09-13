const express = require("express");
const authController = require("./../middlewares/auth");
const resultController = require("./../controllers/resultController");
const router = express.Router();

//
router.use(authController.protect, authController.restrictTo("student"));
router.route("/me").get(resultController.getMyInvolvement);
router.route("/me/quizzes/:Id").get(resultController.getMyQuizResult);
router
  .route("/me/practiceSet/:Id")
  .get(resultController.getMyPracticeSetResult);
router.route("/me/exam/:Id").get(resultController.getMyExamResult);
router.route("/me/homeWork").get(resultController.getMyHomeWorkResult);

module.exports = router;
