const { HomeWork, Group, StudentGroup, User } = require("./../models");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeature");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { tagname } = req.body;
  const group = await Group.create({
    instructorId: req.user.id,
    tagname,
  });
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: group,
  });
});

exports.getGroup = catchAsync(async (req, res, next) => {
  const { condition } = new ApiFeatures(req.query)
    .sort()
    .limitFields()
    .pagination();
  if (req.user.role !== "admin") {
    condition.where = {
      instructorId: req.user.id,
    };
  }
  const group = await Group.findAll({
    ...condition,
  });

  if (group.length === 0)
    return next(new AppError("No group found", StatusCodes.NOT_FOUND));
  const groupWithStudent = await Promise.all(
    group.map(async (group) => {
      const no_of_students = await group.countUsers();
      return {
        ...group.dataValues,
        no_of_students,
      };
    })
  );
  res.status(StatusCodes.OK).json({
    status: "success",
    results: groupWithStudent.length,
    data: {
      data: groupWithStudent,
    },
  });
});

exports.getGroupById = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(new AppError("Group not found", StatusCodes.NOT_FOUND));
  }
  const students = await group.getUsers({
    attributes: ["id", "username", "email", "photo"],
    required: false,
  });
  const studentsOnly = students.map((student) => {
    delete student.dataValues.StudentGroup;
    return student;
  });

  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      group,
      students: studentsOnly,
    },
  });
});

exports.getMyGroup = catchAsync(async (req, res, next) => {
  const groups = await StudentGroup.findAll({
    where: {
      studentId: req.user.id,
    },
    attributes: ["groupId", "createdAt"],
  });
  const data = groups.map(async (group) => {
    const studentGroup = await Group.findByPk(group.groupId);
    const count = await studentGroup.countUsers();
    group.dataValues.no_of_students = count;
    group.dataValues.tagname = studentGroup.tagname;
    return group.dataValues;
  });
  const result = await Promise.all(data);
  res.status(StatusCodes.OK).json({
    status: "success",
    data: result,
  });
});
exports.assignStudentInGroup = catchAsync(async (req, res, next) => {
  const { groupId, stdId } = req.params;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(new AppError("Group not found", StatusCodes.NOT_FOUND));
  }
  if (group.instructorId != req.user.id) {
    return next(
      new AppError(
        "You are not authorized to assign student",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  const student = await User.findByPk(stdId);
  await group.addUser(student);
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Student assigned successfully",
    data: group,
  });
});

exports.removeStudentFromGroup = catchAsync(async (req, res, next) => {
  const { groupId, stdId } = req.params;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(new AppError("Group not found", StatusCodes.NOT_FOUND));
  }
  const student = await User.findByPk(stdId);
  await group.removeUser(student);
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Student removed successfully from group",
  });
});

exports.assignHomeWorkInGroup = catchAsync(async (req, res, next) => {
  const { groupId, hwId } = req.params;
  const group = await Group.findByPk(groupId, {
    user: req.user,
  });
  if (!group) {
    return next(new AppError("Group not found", StatusCodes.NOT_FOUND));
  }
  const homework = await HomeWork.findByPk(hwId, {
    user: req.user,
  });
  if (!homework) {
    return next(new AppError("Homework not found", StatusCodes.NOT_FOUND));
  }
  await Group.update(
    { homeworkId: homework.id },
    {
      where: {
        id: group.id,
      },
    }
  );
  await StudentGroup.update(
    {
      status: "pending",
      submittedAt: null,
      checkedAt: null,
      homeWorkAnswer: null,
    },
    {
      where: {
        groupId: group.id,
      },
    }
  );
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Homework assigned successfully to group " + group.tagname,
  });
});
