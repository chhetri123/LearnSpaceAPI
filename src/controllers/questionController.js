const { Question } = require("./../models");
const { questionImageUpload, createFolder } = require("./../middlewares/s3");
const {
  updateOne,
  getAll,
  getOne,
  createOne,
  deleteOne,
} = require("./handlerController");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const fs = require("fs");

exports.getAllQuestion = getAll(Question);
exports.getQuestion = getOne(Question);
exports.deleteQuestion = deleteOne(Question);

//
const questionHandler = (req) => {
  req.body.answers = [];
  const options = {};
  Object.keys(req.body).forEach((key) => {
    if (key.startsWith("option")) {
      req.body.answers.push(req.body[key]);
      options[key] = req.body[key];
      delete req.body[key];
    }
  });
  if (req.files) {
    Object.keys(req.files).forEach((key) => {
      if (key.startsWith("option")) {
        req.body.answers.push(`/images/${req.files[key][0].key}`);
        options[key] = `/images/${req.files[key][0].key}`;
      }
    });
    if (req.files.image) {
      req.body.image = `/images/${req.files["image"][0].key}`;
    }
  }
  if (req.body.answers.length === 0) delete req.body.answers;

  if (req.body.correct_answers === undefined) return req.body;
  req.body.correct_answers = req.body.correct_answers
    .split(",")
    .map((answer) => {
      return options[answer];
    });
  return req.body;
};
exports.createQuestion = catchAsync(async (req, res, next) => {
  req.body.ownerId = req.user.id;
  const newQuestion = questionHandler(req);
  const doc = await Question.create(newQuestion);
  if (!doc) return next(new AppError("Document  cannot be created", 404));
  if (req.body.tags && req.body.tags.length > 0) {
    const tags = req.body.tags.split(",");
    await doc.addTags(tags);
  }
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: doc,
  });
});

exports.updateQuestion = catchAsync(async (req, res, next) => {
  const doc = await Question.update(questionHandler(req), {
    where: { id: req.params.Id },
    returning: true,
    plain: true,
  });
  if (!doc) return next(new AppError("Document  cannot be updated", 404));
  res.status(StatusCodes.OK).json({
    status: "success",
    data: doc[1],
  });
});
//
exports.searchQuestion = catchAsync(async (req, res, next) => {
  const attributes = req.body;

  const questions = await Question.findAll({
    where: attributes,
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });

  if (!questions) return next(new AppError("No question found", 404));

  res.status(StatusCodes.OK).send({
    status: "success",
    data: {
      data: questions,
    },
  });
});

// Bulk data upload

exports.uploadQuestions = catchAsync(async (req, res, next) => {
  let regex = new RegExp(/[^\s]+(.*?).(jpg|jpeg|png|JPG|JPEG|PNG)$/);
  const questions = req.data.map(async (question) => {
    const optionsArray = [];
    const answersArray = [];
    for (let key in question) {
      if (key.includes("option") && question[key] !== null) {
        if (regex.test(question[key])) {
          const imagePath = await questionImageUpload(question[key], req.user);
          optionsArray.push("/images/" + imagePath);
        } else {
          optionsArray.push(question[key]);
        }
        delete question[key];
      }
      if (key.includes("answer") && question[key] !== null) {
        answersArray.push(optionsArray[+question[key] - 1]);
        delete question[key];
      } else {
        if (regex.test(question[key])) {
          const imageName = await questionImageUpload(question[key], req.user);
          question[key] = "/images/" + imageName;
        }
      }
    }

    return {
      ...question,
      answers: optionsArray,
      correct_answers: answersArray,
      ownerId: req.user.id,
      skillId: req.body.skillId,
      topicId: req.body.topicId ? req.body.topicId : null,
    };
  });
  const allquestion = await Promise.all(questions);

  await Question.bulkCreate(allquestion, {
    returning: true,
    validate: true,
  });
  const folderPath = `public/files/question/${req.user.id
    .split("-")
    .join("")}_questions/`;
  if (fs.existsSync(folderPath)) {
    // delete folder
    fs.rm(folderPath, { recursive: true }, (err) => {});
  }

  res.json({
    status: "success",
    msg: questions.length + " questions uploaded successfully",
  });
});

exports.uploadQuestionImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next(new AppError("No files uploaded", 400));
  await createFolder(`questions/${req.user.id.split("-").join("")}_questions/`);
  res.status(StatusCodes.OK).send({
    status: "success",
    msg: "Successfully uploaded !" + req.files.length + " images",
  });
});
