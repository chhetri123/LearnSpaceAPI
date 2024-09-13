const { Skill, Section, Topic, Tag } = require("./../models");
const {
  updateOne,
  getAll,
  getOne,
  createOne,
  deleteOne,
} = require("./handlerController");
//Skill
exports.getAllSkill = getAll(Skill);
exports.getSkill = getOne(Skill);
exports.createSkill = createOne(Skill);
exports.updateSkill = updateOne(Skill);
exports.deleteSkill = deleteOne(Skill);

// Section
exports.getAllSections = getAll(Section);
exports.getSection = getOne(Section);
exports.createSection = createOne(Section);
exports.updateSection = updateOne(Section);
exports.deleteSection = deleteOne(Section);

// Topics
exports.getAllTopics = getAll(Topic);
exports.getTopic = getOne(Topic);
exports.createTopic = createOne(Topic);
exports.updateTopic = updateOne(Topic);
exports.deleteTopic = deleteOne(Topic);

// TAGS
exports.getAllTags = getAll(Tag);
exports.getTag = getOne(Tag);
exports.createTag = createOne(Tag);
exports.updateTag = updateOne(Tag);
exports.deleteTag = deleteOne(Tag);
