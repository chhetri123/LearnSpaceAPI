const express = require("express");
const userController = require("./../controllers/userController");
const auth = require("./../middlewares/auth");
const imageUpload = require("./../middlewares/fileHandler");
const router = express.Router();

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.get("/logout", auth.isLoggedIn, auth.logout);
router.post("/forgetPassword", auth.forgetPassword);
router.patch("/resetPassword/:token", auth.resetPassword);
router
  .route("/validate/userprofile")
  .get(auth.protect, userController.checkUserData)
  .patch(userController.updateProfileForValidation);
router.use(auth.protect);
router.patch("/updateMyPassword", auth.updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch(
  "/updateMe",
  imageUpload.uploadPhoto,
  imageUpload.resizePhoto,
  userController.updateMe
);

router
  .route("/search/students")
  .get(
    auth.restrictTo("admin", "teacher", "parent"),
    userController.searchStudents
  );
router.delete("/deleteMe", userController.deleteMe);

// Instructor Routes;
router
  .route("/instructor/create-meeting")
  .post(auth.restrictTo("instructor", "admin"), userController.createMeeting);
router
  .route("/instructor/add-meeting-time")
  .post(auth.restrictTo("instructor", "admin"), userController.addMeetingTime);

//

// Group Request Handling By Users
router.route("/group/request").get(userController.getMyGroupRequests);
router
  .route("/group/:groupId/accept-request")
  .post(userController.acceptRequestByUser);
router
  .route("/group/:groupId/decline-request")
  .post(userController.declineRequestByUser);

//
auth.restrictTo("instructor", "admin", "parent"),
  router
    .route("/instructor/find-instructor")
    .get(userController.findInstructor);
router.route("/instructor/meetingTime").get(userController.getAllMeetingTime);
router.route("/instructor/:Id").get(userController.getInstructorById);

router.route("/instructor/addStudent/:Id").post(userController.addStudent);
router
  .route("/instructor/acceptStudent/:Id")
  .post(userController.acceptRequestByInstructor);
router
  .route("/instructor/declineStudent/:Id")
  .post(userController.declineStudent);
router.route("/instructor/studentRequest").post(userController.studentRequest);
// only admin can do this

//
// Parent Routes
router
  .route("/parents/add-child/:Id")
  .post(auth.restrictTo("parent"), userController.addChild);
router
  .route("/parents/my-children")
  .get(auth.restrictTo("parent"), userController.getMyChildren);

// Student Routes
router.use(auth.restrictTo("student", "admin"));
router
  .route("/students/request/:Id")
  .post(userController.acceptRequestByStudent);
router.route("/students/request").get(userController.getMyRequests);

router
  .route("/students/sendrequest/:Id")
  .post(userController.sendRequetToInstructor);

router.route("/meeting/:Id").delete(userController.deleteMeetings);
router.use(auth.restrictTo("admin"));
router.route("/").get(userController.getAllUsers).post(userController.createUser);
router
  .route("/:Id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
