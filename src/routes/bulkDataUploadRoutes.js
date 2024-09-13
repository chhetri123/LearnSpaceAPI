const express = require("express");
const auth = require("./../middlewares/auth");
const {
  uploadFiles,
  bulkDataUpload,
  uploadImages,
} = require("./../middlewares/bulkData");
const questionController = require("./../controllers/questionController");
const userController = require("./../controllers/userController");
const router = express.Router();
router.use(auth.protect, auth.restrictTo("admin", "teacher"));
router
  .route("/questions")
  .post(uploadFiles, bulkDataUpload, questionController.uploadQuestions);
router
  .route("/questionsImages")
  .post(uploadImages, questionController.uploadQuestionImages);
router
  .route("/users")
  .post(uploadFiles, bulkDataUpload, userController.uploadUsers);
module.exports = router;
