const catchAsync = require("./../utils/catchAsync");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");
const {
  Quiz,
  TestSchedule,
  Exam,
  PracticeSet,
  VideoSet,
  LessionSet,
  UserGroup,
} = require("./../models");
const { deleteOne } = require("./handlerController");
const apiFeature = require("../utils/apiFeature");
exports.getAllSessions = catchAsync(async (req, res, next) => {
  const { condition } = new apiFeature(req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const data = await TestSchedule.findAll({
    ...condition,
    include: [
      {
        model: UserGroup,
        as: "userGroups",
        attributes: ["id", "userGroupName"],
        through: { attributes: [] },
      },
    ],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    results: data.length,
    data,
  });
});

exports.deleteSession = catchAsync(async (req, res, next) => {
  req.params.Id = req.params.sessionId;
  return deleteOne(TestSchedule)(req, res, next);
});
const createSessionOnModel = catchAsync(async (req, res) => {
  const { userGroups } = req.body;
  req.body.code = "";
  if (!userGroups)
    return next(
      new AppError("User Groups are required", StatusCodes.PRECONDITION_FAILED)
    );
  delete req.body.userGroups;

  const schedule = await TestSchedule.create(req.body);

  await schedule.addUserGroups(userGroups.split(","));
  res.status(StatusCodes.CREATED).json({
    status: "success",
    msg: "Session created successfully",
  });
});

exports.createSessionOnQuiz = (req, res, next) => {
  req.body.quizId = req.params.Id;
  return createSessionOnModel(req, res);
};
exports.createSessionOnExamSet = (req, res, next) => {
  req.body.examId = req.params.Id;
  return createSessionOnModel(req, res);
};
exports.createSessionOnPracticeSet = (req, res, next) => {
  req.body.practicesetId = req.params.Id;
  return createSessionOnModel(req, res);
};

exports.createSessionOnVideoSet = (req, res, next) => {
  req.body.videoSetId = req.params.Id;
  return createSessionOnModel(req, res);
};

exports.createSessionOnLessionSet = (req, res, next) => {
  req.body.lessionSetId = req.params.Id;
  return createSessionOnModel(req, res);
};

exports.updateSession = catchAsync(async (req, res, next) => {
  const { userGroups } = req.body;
  delete req.body.userGroups;

  const modelSchedule = await TestSchedule.findOne({
    where: {
      id: req.params.sessionId,
    },
  });
  if (!modelSchedule)
    return next(new AppError("Invalid Id ! Not found", StatusCodes.NOT_FOUND));
  if (modelSchedule.status === "expired")
    return next(
      new AppError(
        "You can't update once quiz schedule starts or expired. Please create a new schedule",
        StatusCodes.BAD_REQUEST
      )
    );
  const schedule = await modelSchedule.update(req.body, {
    individualHooks: true,
  });

  if (userGroups && userGroups !== "")
    await schedule.setUserGroups(userGroups.split(","));
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Schedule updated successfully",
  });
});

exports.getSessionById = catchAsync(async (req, res, next) => {
  const schedule = await TestSchedule.findOne({
    where: {
      id: req.params.sessionId,
    },
    include: [
      {
        model: UserGroup,
        as: "userGroups",
        attributes: ["id", "userGroupName"],
        through: {
          attributes: [],
        },
      },
    ],
  });
  if (!schedule)
    return next(new AppError("Invalid Id ! Not found", StatusCodes.NOT_FOUND));
  res.status(StatusCodes.OK).json({
    status: "success",
    data: schedule,
  });
});
