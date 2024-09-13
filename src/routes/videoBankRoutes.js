const express = require("express");
const router = express.Router();
const videoBankController = require("../controllers/videoBankController");
const sessionController = require("../controllers/sessionController");
const { uploadThumbnail } = require("../middlewares/fileHandler");

router
  .route("/videobank/")
  .get(videoBankController.getAllVideoBanks)
  .post(uploadThumbnail, videoBankController.createVideoBank);
router
  .route("/videobank/:Id")
  .get(videoBankController.getVideoBank)
  .patch(videoBankController.updateVideoBank)
  .delete(videoBankController.deleteVideoBank);

router
  .route("/videoset")
  .get(videoBankController.getVideoSets)
  .post(videoBankController.addVideoSet);
router
  .route("/videoset/:Id")
  .patch(videoBankController.updateVideoSet)
  .delete(videoBankController.deleteVideoSet);
router
  .route("/videoset/:Id/session")
  .post(sessionController.createSessionOnVideoSet);
router
  .route("/videoset/:Id/videos")
  .get(videoBankController.getVideos)
  .post(videoBankController.addVideoToSet)
  .patch(videoBankController.removeVideoFromSet);
router.route("/videoset/:Id/search-video").get(videoBankController.searchVideo);

module.exports = router;
