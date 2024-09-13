const catchAsync = require("../utils/catchAsync");

exports.searchQuestion = catchAsync(async (req, res, next) => {
  const { skill, topic, tag } = req.query;
  let whereClause = {};
  if (skill) {
    whereClause["$skill.name$"] = skill;
    delete req.query.skill;
  }
  if (topic) {
    whereClause["$topic.name$"] = topic;
    delete req.query.topic;
  }
  if (tag) {
    whereClause["$tags.name$"] = tag;
    delete req.query.tag;
  }
  req.whereClause = Object.keys(whereClause).length > 0 ? whereClause : null;
  next();
});
