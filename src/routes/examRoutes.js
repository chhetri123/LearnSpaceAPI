const express = require("express");
const auth = require("./../middlewares/auth");
const examSetController = require("./../controllers/examSetController");
const sessionController = require("./../controllers/sessionController");
const router = express.Router();
router.use(auth.protect);
router
  .route("/")
  .get(examSetController.getAllExamSet)
  .post(
    auth.protect,
    auth.restrictTo("admin", "teacher"),
    examSetController.setOwnerName,
    examSetController.createExamSet
  );

//
router
  .route("/examtypes")
  .get(auth.restrictTo("admin", "teacher"), examSetController.getExamType)
  .post(auth.restrictTo("admin", "teacher"), examSetController.addExamType);

router
  .route("/:Id")
  .get(examSetController.getExamSet)
  .patch(auth.restrictTo("admin", "teacher"), examSetController.updateExamSet)
  .delete(auth.restrictTo("admin", "teacher"), examSetController.deleteExamSet);
router
  .route("/:Id/sections")
  .get(examSetController.getExamSections)
  .post(examSetController.addExamSection);

router
  .route("/:Id/sections/:sectionId")
  .get(examSetController.getExamSection)
  .patch(examSetController.updateExamSection);

router
  .route("/:examId/sections/:Id/questions")
  .get(examSetController.getQuestionOfSections)
  .post(
    auth.restrictTo("admin", "teacher"),
    examSetController.addQuestionToSection
  )
  .patch(
    auth.restrictTo("admin", "teacher"),
    examSetController.removeQuestionFromSection
  );

//
router.route("/:Id/startExamSet").get(examSetController.getQuestionOfExam);
router
  .route("/:Id/question/:questionId")
  .post(auth.protect, examSetController.checkExamAnswer);
router.use(auth.restrictTo("admin", "teacher"));

router
  .route("/examtypes")
  .get(examSetController.getExamType)
  .post(examSetController.addExamType);

router
  .route("/examtypes/:Id")
  .delete(examSetController.deleteExamType)
  .patch(examSetController.updateExamType);
router.route("/:Id/session").post(sessionController.createSessionOnExamSet);

module.exports = router;
