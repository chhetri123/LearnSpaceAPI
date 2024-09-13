const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeature");
const { StatusCodes } = require("http-status-codes");
const { User, Question } = require("./../models");
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.Id);
    const doc = await Model.destroy({
      where: { id: req.params.Id },
    });
    if (!doc) return next(new AppError("Invalid Id Doc not found", 404));

    res.status(StatusCodes.NO_CONTENT).json({
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    req.body.ownerId = req.user.id;
    if (req.file) {
      req.body.image = `/images/question/${req.file.filename}`;
    }
    const doc = await Model.create(req.body);
    if (!doc) return next(new AppError("Document  cannot be created", 404));
    if (req.body.tags && req.body.tags.length > 0) {
      const tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(",");
      await doc.addTags(tags);
    }
    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.update(
      req.body,
      { where: { id: req.params.Id }, individualHooks: true },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) return next(new AppError("Document cannot be created", 404));

    res.status(StatusCodes.OK).send({
      status: "success",
      data: doc[1],
    });
  });

exports.getOne = (Model, popOption = {}) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne(
      {
        where: { id: req.params.Id },
        ...popOption,
      },
      { user: req.user }
    );

    const doc = await query;
    if (!doc)
      return next(
        new AppError("Document not found with that ID", StatusCodes.NOT_FOUND)
      );

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, popOption = {}) =>
  catchAsync(async (req, res, next) => {
    const { condition } = new ApiFeatures(req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    if (req.whereClause) condition.where = req.whereClause;
    if (req.params.id) condition.where.id = req.params.id;
    const docs = await Model.findAll({
      ...condition,
      user: req.user,
      ...popOption,
    });
    res.status(StatusCodes.OK).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.addQuestionToModel = (Model) => {
  return catchAsync(async (req, res, next) => {
    const haveModel = await Model.findByPk(req.params.Id, {
      user: req.user,
    });
    if (!haveModel) {
      return next(new AppError(`Invalid Id ${Model.name} not found`, 404));
    }
    req.body.questionId = Array.isArray(req.body.questionId)
      ? req.body.questionId
      : req.body.questionId.split(",");
    const sets = await haveModel.addQuestions([...req.body.questionId]);
    if (!sets)
      return res.status(StatusCodes.PRECONDITION_REQUIRED).json({
        status: "success",
        msg: "Questions Already Added",
      });
    res.status(StatusCodes.OK).json({
      status: "success",
      msg: `${sets.length} Questions Added to ${Model.name}`,
    });
  });
};
exports.getQuestionOfModels = (Model, props) => {
  return catchAsync(async (req, res, next) => {
    const setQuestions = await Model.findAll({
      where: { [props]: req.params.Id },
      attributes: {
        exclude: ["id", props],
      },
    });

    const questionIds = setQuestions.map(
      (setQuestion) => setQuestion.questionId
    );
    this.getAll(Question, {
      where: { id: questionIds },
    })(req, res, next);
  });
};

exports.checkAnswer = function (Model, ModelResult, ModelQue, modelId) {
  return catchAsync(async (req, res, next) => {
    const { totalTime, answerGiven } = req.body;
    await answerGiven.forEach(async (answered) => {
      const questionId = answered.questionId;
      const modelData = await Model.findOne({ where: { id: req.params.Id } });
      const question = await ModelQue.findOne({ where: { id: questionId } });
      const isCorrect = await question.checkAnswer(
        answered.answers,
        question.correct_answers
      );
      let negativeMark = 0;
      if (!isCorrect && modelData.isNegativeMark) {
        modelData.point = modelData.point - modelData.negativeMark;
        negativeMark = modelData.negativeMark;
      }
      const alreadyAnswered = await ModelResult.findOne({
        where: {
          userId: req.user.id,
          questionId,
          [modelId]: req.params.Id,
        },
      });
      if (!modelData.isTimeBound) {
        totalTime = 0;
      }
      if (alreadyAnswered) {
        await ModelResult.update(
          {
            remark: isCorrect,
            yourAnswer: answered.answers,
            point: modelData.point,
            time_taken: +totalTime / answerGiven.length,
            no_of_attempt: alreadyAnswered.no_of_attempt + 1,
            negativeMark,
          },
          { where: { id: alreadyAnswered.id } }
        );
      } else {
        await ModelResult.create({
          userId: req.user.id,
          [modelId]: req.params.Id,
          questionId,
          yourAnswer: answered.answers,
          section: question.section,
          skill: question.skill,
          remark: isCorrect,
          point: modelData.point,
          negativeMark,
          time_taken: +totalTime / answerGiven.length,
        });
      }
    });
    res.status(StatusCodes.OK).json({
      status: "success",
      message: `Your ${answerGiven.length} Answer submitted successfully`,
    });
  });
};

exports.getRequest = (Model, relation, attribute) => {
  return catchAsync(async (req, res, next) => {
    const { condition } = new ApiFeatures(req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    condition.where[attribute] = req.user.id;
    const docs = await Model.findAll({
      ...condition,
      include: {
        model: User,
        as: relation,
        attributes: ["id", "username", "email", "photo"],
      },
    });
    res.status(StatusCodes.OK).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });
};

exports.acceptRequest = (Model, attribute) => {
  return catchAsync(async (req, res, next) => {
    const { status } = req.query;

    const realtionModel = await Model.findOne({
      where: {
        [attribute]: req.user.id,
        id: req.params.Id,
      },
    });

    if (!realtionModel)
      return next(new AppError("No Request Found", StatusCodes.NOT_FOUND));

    if (["accepted", "rejected"].indexOf(status) === -1) {
      status = realtionModel.status;
    }
    await realtionModel.update({
      status: status,
    });
    res.status(StatusCodes.OK).json({
      status: "success",
      msg: "Request " + status + " successfully",
    });
  });
};

exports.addSetIntoModel = (Model) => {
  return catchAsync(async (req, res, next) => {
    const isSetExist = await Model.findOrCreate({
      where: {
        skillId: req.body.skillId,
        subCategoryId: req.body.subCategoryId,
      },
      defaults: {
        skillId: req.body.skillId,
        subCategoryId: req.body.subCategoryId,
        status: req.body.status || "active",
      },
    });
    res.status(201).json({
      status: "success",
      data: isSetExist[0],
    });
  });
};
