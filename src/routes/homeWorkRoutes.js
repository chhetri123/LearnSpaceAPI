const express = require("express");
const auth = require("./../middlewares/auth");
const homeWorkController = require("./../controllers/homeWorkController");
const { fileUpload } = require("./../middlewares/fileHandler");

const router = express.Router();
// router.use(auth.protect, auth.restrictTo("admin", "teacher"));
// homework should only psoted by teacher
// teacher can only view his/her homework
router.use(auth.protect);
router
  .route("/")
  .get(homeWorkController.getAllHomeWork)
  .post(fileUpload, homeWorkController.createHomeWork);
router.route("/:Id/addQuestion").post(homeWorkController.addQuestion);
router
  .route("/:homeworkId/student/:studentId")
  .post(homeWorkController.addHomeworkToStudent);
router.route("/myhomeworks").get(homeWorkController.getMyIndividualHomeWorks);
router
  .route("/myhomeworks/:Id")
  .get(homeWorkController.getMyIndividualHomeWork);
router
  .route("/myhomeworks/:hwId/submit")
  .post(
    fileUpload,
    homeWorkController.attachmentSubmission,
    homeWorkController.submitIndividualHomeWork
  );
router
  .route("/student-submission")
  .get(homeWorkController.getSubmissionHomeWork);
router
  .route("/checkIndividualAnswer/:Id")
  .post(homeWorkController.checkIndividualHomeWork);
module.exports = router;
