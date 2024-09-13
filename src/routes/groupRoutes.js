const express = require("express");
const auth = require("./../middlewares/auth");
const groupController = require("./../controllers/groupController");
const homeWorkController = require("./../controllers/homeWorkController");
const { fileUpload } = require("./../middlewares/fileHandler");

const router = express.Router();
router.use(auth.protect);
// homework should only psoted by teacher
// teacher can only view his/her homework
router
  .route("/:groupId/submitHomeWork/:hwId")
  .post(fileUpload, homeWorkController.submitHomeWork);
router.route("/:groupId/getHomeWork").get(homeWorkController.getMyHomeWork);
router.route("/me/mygroups").get(groupController.getMyGroup);

router
  .route("/:groupId/getSubmisssionHomework")
  .get(auth.restrictTo("teacher"), homeWorkController.getSubmissions);

router.route("/:groupId").get(groupController.getGroupById);
//  restrict to admin and teacher
// router.use(auth.restrictTo("admin", "teacher"));
router
  .route("/:groupId/checkHomeWork/:hwId/student/:stdId")
  .post(homeWorkController.checkHomeWork);
router
  .route("/")
  .post(groupController.createGroup)
  .get(groupController.getGroup);
router
  .route("/:groupId/assignStudent/:stdId")
  .post(groupController.assignStudentInGroup);
router
  .route("/:groupId/assignHomeWork/:hwId")
  .post(groupController.assignHomeWorkInGroup);
router
  .route("/:groupId/removeStudent/:stdId")
  .post(groupController.removeStudentFromGroup);

//   restrict to teacher only

module.exports = router;
