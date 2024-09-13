const express = require("express");
const auth = require("./../middlewares/auth");
const statsController = require("./../controllers/statsController");
const router = express.Router();

//
router.use(auth.protect, auth.restrictTo("admin", "teacher"));
router.route("/dashboard").get(statsController.getDashboardStats);
router.route("/quizzes/:Id").get(statsController.getQuizResults);
router.route("/practiceSet/:Id").get(statsController.getPracticeResults);
router.route("/exam/:Id").get(statsController.getExamResults);
router.route("/userRegistraion").get(statsController.userRegistrationStats);
module.exports = router;
