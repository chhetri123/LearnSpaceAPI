const express = require("express");
const auth = require("./../middlewares/auth");
const practiceSetController = require("./../controllers/practiceSetController");
const sessionController = require("./../controllers/sessionController");
const router = express.Router();
router.use(auth.protect);
router
  .route("/")
  .get(practiceSetController.getAllPracticeSet)
  .post(
    auth.restrictTo("admin", "teacher"),
    practiceSetController.setOwnerName,
    practiceSetController.createPracticeSet
  );
router.route("/:Id").get(practiceSetController.getPracticeSet);
router.route("/:Id/session").post(sessionController.createSessionOnPracticeSet);
router
  .route("/:Id/question")
  .get(practiceSetController.getQuestionOfPracticeSet);
router
  .route("/:Id/startPracticeSet")
  .get(practiceSetController.getQuestionOfPracticeSet);
router
  .route("/:Id/question/:questionId")
  .post(auth.restrictTo("student"), practiceSetController.answerPracticeSet);

router.use(auth.restrictTo("admin", "teacher"));
router
  .route("/:Id")
  .patch(practiceSetController.updatePracticeSet)
  .delete(practiceSetController.deletePracticeSet);
router.route("/:Id/addQuestion").post(practiceSetController.addQuestion);
module.exports = router;
