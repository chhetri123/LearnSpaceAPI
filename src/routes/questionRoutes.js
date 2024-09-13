const express = require("express");
const auth = require("./../middlewares/auth");
const search = require("./../middlewares/search");
const questionController = require("./../controllers/questionController");
const imageUpload = require("./../middlewares/fileHandler");
const router = express.Router();
router.use(auth.protect, auth.restrictTo("admin", "teacher"));
router
  .route("/")
  .get(search.searchQuestion, questionController.getAllQuestion)
  .post(imageUpload.questionUpload, questionController.createQuestion);

router.route("/search").post(questionController.searchQuestion);
router
  .route("/:Id")
  .get(questionController.getQuestion)
  .patch(imageUpload.questionUpload, questionController.updateQuestion)
  .delete(questionController.deleteQuestion);

module.exports = router;
