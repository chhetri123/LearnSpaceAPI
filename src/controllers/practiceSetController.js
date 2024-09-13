const {
  PracticeSet,
  PracticeSetResult,
  Question,
  PracticeSetsQuestion,
} = require("./../models");
const {
  getOne,
  createOne,
  updateOne,
  getAll,
  deleteOne,
  getQuestionOfModels,
  addQuestionToModel,
  checkAnswer,
} = require("./handlerController");
const catchAsync = require("../utils/catchAsync");
//
exports.setOwnerName = catchAsync(async (req, res, next) => {
  req.body.ownerId = req.user.id;
  next();
});

//
exports.createPracticeSet = createOne(PracticeSet);
exports.updatePracticeSet = updateOne(PracticeSet);
exports.getAllPracticeSet = getAll(PracticeSet);
exports.getPracticeSet = getOne(PracticeSet);
exports.deletePracticeSet = deleteOne(PracticeSet);
exports.getQuestionOfPracticeSet = getQuestionOfModels(
  PracticeSetsQuestion,
  "practiceSetId"
);
//
exports.addQuestion = addQuestionToModel(PracticeSet);
//
exports.answerPracticeSet = checkAnswer(
  PracticeSet,
  PracticeSetResult,
  Question,
  "practiceSetId"
);
