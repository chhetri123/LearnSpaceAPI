const express = require("express");
const auth = require("../middlewares/auth");
const sessionController = require("./../controllers/sessionController");

const router = express.Router();
router.use(auth.protect);
router.route("/").get(sessionController.getAllSessions);

router
  .route("/:sessionId")
  .get(sessionController.getSessionById)
  .patch(sessionController.updateSession)
  .delete(sessionController.deleteSession);
module.exports = router;
