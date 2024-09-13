const express = require("express");
const auth = require("../middlewares/auth");
const lessionController = require("./../controllers/lessionController");
const sessionController = require("./../controllers/sessionController");
const router = express.Router();
router.use(auth.protect);

router
  .route("/lessions/")
  .get(lessionController.getAllLessions)
  .post(lessionController.addLession);
router
  .route("/lessions/:Id")
  .get(lessionController.getLession)
  .patch(lessionController.updateLession)
  .delete(lessionController.deleteLession);
router
  .route("/lessions-set")
  .get(lessionController.getLessionSets)
  .post(lessionController.addLessionSet);
router
  .route("/lessions-set/:Id")
  .patch(lessionController.updateLessionSet)
  .delete(lessionController.deleteLessionSet);
router
  .route("/lessions-set/:Id/session")
  .post(sessionController.createSessionOnLessionSet);
router
  .route("/lessions-set/:Id/lessions")
  .get(lessionController.getLessions)
  .post(lessionController.addLessionToSet)
  .patch(lessionController.removeLessionFromSet);
router
  .route("/lessions-set/:Id/search-lession")
  .get(lessionController.searchLession);
module.exports = router;
