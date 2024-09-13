const {
  Exam,
  ExamType,
  Question,
  ExamResult,
  ExamSection,
  ExamSectionQuestion,

  Section,
} = require("./../models");
const {
  getOne,
  createOne,
  updateOne,
  getAll,
  getQuestionOfModels,
  addQuestionToModel,
  checkAnswer,
  deleteOne,
} = require("./handlerController");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//
exports.setOwnerName = catchAsync(async (req, res, next) => {
  req.body.ownerId = req.user.id;
  next();
});

//
exports.createExamSet = createOne(Exam);
exports.updateExamSet = updateOne(Exam);
exports.getAllExamSet = getAll(Exam);
exports.getExamSet = getOne(Exam, {
  include: [
    {
      model: ExamSection,
      as: "examSections",
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: {
        model: Question,
        as: "questions",
        through: { attributes: [] },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    },
  ],
});

// Exam Type
exports.getExamType = getAll(ExamType);
exports.addExamType = createOne(ExamType);
exports.deleteExamType = updateOne(ExamType);
exports.updateExamType = updateOne(ExamType);

//
exports.getQuestionOfExam = getQuestionOfModels(
  ExamSectionQuestion,
  "examSectionId"
);
//
exports.addQuestion = addQuestionToModel(Exam);

//
exports.deleteExamSet = deleteOne(Exam);

exports.checkExamAnswer = checkAnswer(Exam, ExamResult, Question, "examId");

exports.getExamSections = async (req, res, next) => {
  return getAll(ExamSection, {
    where: { examId: req.params.Id },
  })(req, res, next);
};

exports.addExamSection = catchAsync(async (req, res, next) => {
  req.body.examId = req.params.Id;
  const exam = await Exam.findByPk(req.params.Id);
  if (!exam) return next(new AppError("Invalid Id Exam not found", 404));
  const examSection = await ExamSection.create(req.body);
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: examSection,
  });
});

//
exports.updateExamSection = catchAsync(async (req, res, next) => {
  req.body.examId = req.params.Id;
  const examSection = await ExamSection.update(
    req.body,
    { where: { id: req.params.sectionId } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(StatusCodes.OK).json({
    status: "success",
    data: examSection,
  });
});
exports.getExamSection = catchAsync(async (req, res, next) => {
  return getAll(ExamSection, {
    where: { id: req.params.sectionId },
    include: {
      model: Question,
      as: "questions",
      through: { attributes: [] },
    },
  })(req, res, next);
});
exports.getQuestionOfSections = catchAsync(async (req, res, next) => {
  return getAll(ExamSectionQuestion, {
    where: { examSectionId: req.params.sectionId },
  })(req, res, next);
});
exports.addQuestionToSection = catchAsync(async (req, res, next) => {
  const haveModel = await ExamSection.findByPk(req.params.Id);
  if (!haveModel) {
    return next(new AppError(`Invalid Id ${Model.name} not found`, 404));
  }
  const sets = await haveModel.addQuestions([...req.body.questionId]);
  if (!sets)
    return res.status(StatusCodes.PRECONDITION_REQUIRED).json({
      status: "success",
      msg: "Questions Already Added",
    });
  await haveModel.update({
    totalQuestion: haveModel.totalQuestion + sets.length,
    totalMarks: haveModel.totalMarks,
    totalDuration: haveModel.totalDuration,
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    results: sets.length,
    data: sets,
  });
});

exports.removeQuestionFromSection = catchAsync(async (req, res, next) => {
  const haveModel = await ExamSection.findByPk(req.params.Id);
  if (!haveModel) {
    return next(new AppError(`Invalid Id ${Model.name} not found`, 404));
  }
  const sets = await haveModel.removeQuestions([...req.body.questionId]);
  if (!sets)
    return res.status(StatusCodes.PRECONDITION_REQUIRED).json({
      status: "success",
      msg: "Questions Not Exist",
    });
  await haveModel.update({
    totalQuestion: haveModel.totalQuestion - req.body.questionId.length,
    totalMarks: haveModel.totalMarks,
    totalDuration: haveModel.totalDuration,
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    results: sets.length,
    data: sets,
  });
});
