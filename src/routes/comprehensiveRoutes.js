const express = require("express");
const auth = require("./../middlewares/auth");
const comprehensiveController = require("./../controllers/comprehensiveController");
const router = express.Router();

router.use(auth.protect, auth.restrictTo("admin", "teacher"));
router
  .route("/")
  .get(comprehensiveController.getAllComprehensive)
  .post(comprehensiveController.createComprehensive);
router
  .route("/:Id")
  .get(comprehensiveController.getComprehensive)
  .patch(comprehensiveController.updateComprehensive)
  .delete(comprehensiveController.deleteComprehensive);
module.exports = router;
