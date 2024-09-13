const {
  HomeWork,
  Group,
  StudentGroup,
  HomeworkResult,
  Session,
  User,
  Question,
  HomeworkQuizResult,
  IndividualHomework,
} = require("./../models");
const {
  getAll,
  getOne,
  checkAnswer,
  addQuestionToModel,
} = require("./handlerController");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//
exports.getAllHomeWork = getAll(HomeWork);
exports.addQuestion = addQuestionToModel(HomeWork);

//
exports.addHomeworkToStudent = catchAsync(async (req, res, next) => {
  const { homeworkId, studentId } = req.params;
  const homework = await HomeWork.findByPk(homeworkId, { user: req.user });
  if (!homework) return next(new AppError("Homework not found", 404));
  const individualHomework = await IndividualHomework.create({
    homeworkId,
    studentId,
    teacherId: req.user.id,
  });
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: individualHomework,
  });
});

//
exports.createHomeWork = catchAsync(async (req, res, next) => {
  const { startDate, dueDate } = req.body;

  req.body.instructorId = req.user.id;
  if (req.files) {
    console.log(req.files);
    req.body.attachment = req.files.map((file) => `/images/${file.key}`);
  }
  const session = await Session.create({ dueDate, startDate });
  const homeWork = await HomeWork.create({
    ...req.body,
    sessionId: session.id,
  });
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: homeWork,
  });
});

exports.getMyHomeWork = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const inGroup = await StudentGroup.findOne({
    where: { groupId, studentId: req.user.id },
    attributes: ["homeWorkAnswer", "status", "submittedAt", "checkedAt"],
  });
  if (!inGroup)
    return next(
      new AppError("You are not in this group", StatusCodes.NOT_FOUND)
    );

  const homeWork = await Group.findOne({
    where: {
      id: groupId,
    },
    user: {
      role: "admin",
    },
    include: [
      {
        model: HomeWork,
        as: "homework",
        include: [
          {
            model: Session,
            as: "session",
            attributes: ["startDate", "dueDate", "duration"],
          },
        ],

        attributes: ["id", "title", "description", "attachment"],
      },
    ],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      ...inGroup.dataValues,
      ...homeWork.dataValues,
    },
    // data: inGroup,
  });
});

//Model,studentId,IndividualHomework,
exports.submitHomeWork = catchAsync(async (req, res, next) => {
  const { hwId, groupId } = req.params;
  const haveHomeWork = await Group.findOne({
    where: {
      id: groupId,
      homeworkId: hwId,
    },
    user: {
      role: "admin",
    },
  });
  if (!haveHomeWork) {
    return next(
      new AppError("You don't have any homework", StatusCodes.NOT_FOUND)
    );
  }
  if (!req.files) return next(new AppError("No file uploaded", 400));

  req.body.homeWorkAnswer = req.files.map(
    (file) => `/images/homework/${file.filename}`
  );

  await StudentGroup.update(
    {
      status: "checking",
      submittedAt: Date.now(),
      homeWorkAnswer: req.body.homeWorkAnswer,
    },
    {
      where: {
        studentId: req.user.id,
        groupId,
      },
    }
  );
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: "Homework Submitted Successfully ! Wait for checking",
  });
});

exports.getSubmissions = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(new AppError("Group not found", StatusCodes.NOT_FOUND));
  }
  const submissions = await StudentGroup.findAll({
    where: {
      groupId,
      status: "checking",
    },
    include: [
      {
        model: User,
        attributes: ["id", "username", "email", "photo"],
      },
    ],
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: submissions,
  });
});

exports.checkHomeWork = catchAsync(async (req, res, next) => {
  const { groupId, hwId, stdId } = req.params;
  const { point } = req.body;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(
      new AppError(
        "Either Group not found Or You cannot Check Homework",
        StatusCodes.NOT_FOUND
      )
    );
  }
  const prevAnswer = await StudentGroup.findOne({
    where: {
      groupId,
      studentId: stdId,
    },
  });
  await StudentGroup.update(
    {
      status: "done",
      checkedAt: Date.now(),
      point,
    },
    {
      where: {
        groupId,
        studentId: stdId,
      },
    }
  );
  await HomeworkResult.create({
    studentId: stdId,
    homeworkId: hwId,
    attachmentPoint: point,
    attachmentAnswer: prevAnswer.homeWorkAnswer,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Homework checked successfully",
  });
});

exports.getMyIndividualHomeWorks = catchAsync(async (req, res, next) => {
  const individualHomework = await IndividualHomework.findAll({
    where: {
      studentId: req.user.id,
    },
  });
  if (individualHomework.length === 0)
    return next(
      new AppError("You don't have this homework", StatusCodes.NOT_FOUND)
    );
  res.status(StatusCodes.OK).json({
    status: "success",
    data: individualHomework,
  });
});

exports.getMyIndividualHomeWork = getOne(HomeWork);
exports.submitIndividualHomeWork = catchAsync(async (req, res, next) => {
  const { hwId } = req.params;
  const { quizAnswer } = req.body;
  const homework = await HomeWork.findByPk(hwId);
  const result = await HomeworkResult.findOrCreate({
    where: {
      studentId: req.user.id,
      homeworkId: req.params.hwId,
    },
    defaults: {
      studentId: req.user.id,
      homeworkId: req.params.hwId,
      attachmentPoint: 0,
      attachmentAnswer: req.body.homeWorkAnswer || [],
    },
  });
  if (quizAnswer) {
    quizAnswer.forEach(async (answered) => {
      const questionId = answered.questionId;
      const question = await Question.findOne({ where: { id: questionId } });
      const isCorrect = await question.checkAnswer(
        answered.answers,
        question.correct_answers
      );
      await HomeworkQuizResult.create({
        studentId: req.user.id,
        homeworkResultId: result[0].id,
        questionId,
        yourAnswer: answered.answers,
        section: question.dataValues.section,
        skill: question.dataValues.skill,
        remark: isCorrect,
        point: homework.quizPoint,
      });
    });
  }
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: "Homework Submitted Successfully ! Wait for checking",
  });
});

exports.attachmentSubmission = catchAsync(async (req, res, next) => {
  const { hwId } = req.params;
  const haveHomeWork = await IndividualHomework.findOne({
    where: {
      homeworkId: hwId,
      studentId: req.user.id,
    },
  });
  if (!haveHomeWork) {
    return next(
      new AppError("You don't have any homework", StatusCodes.NOT_FOUND)
    );
  }
  if (req.files) {
    req.body.homeWorkAnswer = req.files.map(
      (file) => `/images/homework/${file.filename}`
    );
  }
  await haveHomeWork.update({
    status: "checking",
    submittedAt: Date.now(),
    homeWorkAnswer: req.body.homeWorkAnswer || [],
  });
  next();
});

exports.getSubmissionHomeWork = catchAsync(async (req, res, next) => {
  const pendingHomework = await IndividualHomework.findAll({
    where: {
      teacherId: req.user.id,
      status: "checking",
    },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "username", "email", "photo"],
      },
    ],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: pendingHomework,
  });
});

exports.checkIndividualHomeWork = catchAsync(async (req, res, next) => {
  const { point } = req.body;
  const individual_homeworks = await IndividualHomework.findOne({
    where: {
      id: req.params.Id,
    },
  });

  if (!individual_homeworks) {
    return next(new AppError("Homework not found", StatusCodes.NOT_FOUND));
  }
  if (individual_homeworks.status == "done") {
    return next(
      new AppError("Homework already checked", StatusCodes.NOT_FOUND)
    );
  }
  const { homeworkId, studentId } = individual_homeworks;
  const prevAnswer = await HomeworkResult.findOne({
    where: {
      homeworkId,
      studentId,
    },
  });
  await individual_homeworks.update({
    status: "done",
    checkedAt: Date.now(),
    point,
  });
  await prevAnswer.update({
    attachmentPoint: point,
    attachmentAnswer: prevAnswer.homeWorkAnswer,
    status: "done",
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Homework checked successfully",
  });
});
