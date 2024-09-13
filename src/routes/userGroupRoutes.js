const express = require("express");
const userController = require("./../controllers/userController");
const auth = require("./../middlewares/auth");

const router = express.Router();
router.use(auth.protect, auth.restrictTo("admin"));

router
  .route("/")
  .get(userController.getUserGroup)
  .post(userController.createUserGroup);
router
  .route("/:Id")
  .get(userController.getUserGroupById)
  .patch(userController.updateUserGroup)
  .delete(userController.deleteUserGroup);
router.route("/:Id/adduser").post(userController.addUserToGroup);

module.exports = router;
