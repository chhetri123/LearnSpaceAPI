const express = require("express");
const auth = require("./../middlewares/auth");
const subjectController = require("./../controllers/subjectController");

const router = express.Router();

router.use(auth.protect);
router
  .route("/skill")
  .get(subjectController.getAllSkill)
  .post(subjectController.createSkill);
router
  .route("/skill/:Id")
  .patch(subjectController.updateSkill)
  .get(subjectController.getSkill)
  .delete(subjectController.deleteSkill);

router
  .route("/section")
  .get(subjectController.getAllSections)
  .post(subjectController.createSection);
router
  .route("/section/:Id")
  .patch(subjectController.updateSection)
  .delete(subjectController.deleteSection)
  .get(subjectController.getSection);

router
  .route("/topic")
  .get(subjectController.getAllTopics)
  .post(subjectController.createTopic);
router
  .route("/topic/:Id")
  .patch(subjectController.updateTopic)
  .delete(subjectController.deleteTopic)
  .get(subjectController.getTopic);

router
  .route("/tag")
  .get(subjectController.getAllTags)
  .post(subjectController.createTag);
router
  .route("/tag/:Id")
  .patch(subjectController.updateTag)
  .delete(subjectController.deleteTag)
  .get(subjectController.getTag);

module.exports = router;
