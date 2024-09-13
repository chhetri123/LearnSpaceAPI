// const sharp = require("sharp");
const { Op, where } = require("sequelize");
const {
  User,
  Meeting,
  MeetingTime,
  ParentStudent,
  InstructorStudent,
  UserGroup,
  UserGroupSet,
} = require("./../models");
const { StatusCodes } = require("http-status-codes");
const factory = require("./handlerController");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const filterObj = (obj, ...filter) => {
  const filteredObj = {};
  Object.keys(obj).forEach((el) => {
    if (filter.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConform) {
    return next(
      new AppError(
        "This route is not for password update.Please use /updateMyPassword",
        StatusCodes.FORBIDDEN
      )
    );
  }

  // filtering the request body
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "gender",
    "dob",
    "address",
    "education",
    "phoneNumber",
    "occupation",
    "account_id",
    "about",
    "description",
    "experience",
    "skills",
    "awards",
    "certifications",
    "languages",
    "location",
    "timezone",
    "status"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  const [_, user] = await User.update(
    filteredBody,
    { where: { id: req.user.id }, returning: true },
    { runValidators: true }
  );

  res.status(StatusCodes.OK).json({
    status: "success",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.update({ status: false }, { where: { id: req.user.Id } });
  res.status(StatusCodes.NO_CONTENT).json({
    status: "success",
    data: null,
  });
});
exports.getMe = (req, res, next) => {
  req.params.Id = req.user.id;
  next();
};
exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, role, groupId, password, isEmailVerified, status } =
    req.body;

  const user = await User.create({
    username,
    email,
    role,
    password,
    isEmailVerified,
    status,
  });
  if (groupId) {
    user.addUserGroups(groupId.split(","));
  }
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.update(req.body);
  if (req.body.groupId) {
    updatedUser.addUserGroups(req.body.groupId.split(","));
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteUser = factory.deleteOne(User);

// Meetings
exports.deleteMeetings = factory.deleteOne(Meeting);

exports.searchStudents = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const students = await User.findAll({
    where: {
      username: {
        [Op.like]: `%${search}%`,
      },
      role: "student",
    },
    attributes: ["id", "username", "email"],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    results: students.length,
    data: {
      students,
    },
  });
});

exports.checkUserData = catchAsync(async (req, res, next) => {
  res.status(StatusCodes.OK).json({
    status: "success",
    profileCompleted: true,
    user: req.user,
  });
});
exports.updateProfileForValidation = catchAsync(async (req, res, next) => {
  if (!req.cookies.profile_validation) {
    return next(
      new AppError(
        "Either You have already completed your profile validation Or Not logged in",
        StatusCodes.FORBIDDEN
      )
    );
  }
  const encodedString = req.cookies.profile_validation.split(".")[0];
  const userId = Buffer.from(encodedString, "base64").toString();
  const filteredBody = filterObj(
    req.body,
    "dob",
    "address",
    "education",
    "phoneNumber",
    "occupation"
  );
  const user = await User.update(
    filteredBody,
    { where: { id: userId }, returning: true },
    { runValidators: true }
  );
  res.cookie("profile_validation", "", { expires: new Date(0) });
  res.status(StatusCodes.OK).json({
    status: "success",
    profileCompleted: true,
    user: user[1][0].dataValues,
  });
});

exports.getInstructorById = catchAsync(async (req, res, next) => {
  const instructor = await User.findOne({
    where: {
      id: req.params.Id,
    },
    include: {
      model: Meeting,
      as: "meeting",
      include: {
        model: MeetingTime,
        as: "meetingTimes",
      },
    },
    attribute: {
      excludeField: ["password"],
    },
  });
  if (!instructor) {
    return next(
      new AppError("No instructor found with this id", StatusCodes.NOT_FOUND)
    );
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      instructor,
    },
  });
});

exports.findInstructor = catchAsync(async (req, res, next) => {
  const instructors = await User.findAll({
    where: {
      role: "teacher",
      location: {
        [Op.ne]: null,
      },
    },
    attributes: ["id", "photo", "username", "address", "email", "location"],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: {
      instructors,
    },
  });
});

exports.createMeeting = catchAsync(async (req, res, next) => {
  if (req.user.hasMeeting)
    return next(
      new AppError(
        "You have already created a meeting schedule",
        StatusCodes.FORBIDDEN
      )
    );
  if (!req.user.meetingAmount)
    return next(
      new AppError(
        "You have not set your meeting amount ! Request To Admin",
        StatusCodes.FORBIDDEN
      )
    );
  const meeting = await Meeting.create({
    amount: req.user.meetingAmount,
  });
  await User.update(
    {
      hasMeeting: true,
      meetingId: meeting.id,
    },
    { where: { id: req.user.id } }
  );

  res.status(StatusCodes.CREATED).json({
    status: "success",
    msg: "Meeting  Created Successfully ! You Can Add Meeting Time Now",
    data: meeting,
  });
});

exports.addMeetingTime = catchAsync(async (req, res, next) => {
  const { day, time, description, status } = req.body;
  const meeting = await Meeting.findOne({ where: { id: req.user.meetingId } });

  if (!meeting)
    return next(
      new AppError(
        "You have not created a meeting schedule",
        StatusCodes.FORBIDDEN
      )
    );
  const meetingTime = await meeting.createMeetingTime({
    day_label: day,
    time,
    description,
    status,
  });
  res.status(StatusCodes.CREATED).json({
    status: "success",
    msg: "Meeting Time Added Successfully !",
    data: meetingTime,
  });
});

exports.getAllMeetingTime = catchAsync(async (req, res, next) => {
  const meeting = await Meeting.findOne({ where: { id: req.user.meetingId } });
  if (!meeting)
    return next(
      new AppError(
        "You have not created a meeting schedule",
        StatusCodes.FORBIDDEN
      )
    );
  const meetingTime = await meeting.getMeetingTimes();
  res.status(StatusCodes.OK).json({
    status: "success",
    data: meetingTime,
  });
});
// Instructor Student

exports.addStudent = catchAsync(async (req, res, next) => {
  const instructor = await InstructorStudent.findOrCreate({
    where: {
      instructorId: req.user.id,
      studentId: req.params.Id,
    },
    defaults: {
      status: "accepted",
    },
  });
  if (!instructor[1]) {
    return next(
      new AppError(
        "Student already added to your network",
        StatusCodes.FORBIDDEN
      )
    );
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Student added to your Network!",
  });
});

exports.acceptRequestByInstructor = factory.acceptRequest(
  InstructorStudent,
  "instructorId"
);
exports.declineStudent = factory.deleteOne(InstructorStudent);
exports.studentRequest = factory.getRequest(
  InstructorStudent,
  "instructorStudents",
  "instructorId"
);
exports.sendRequetToInstructor = catchAsync(async (req, res, next) => {
  const student = await InstructorStudent.findOrCreate({
    where: {
      instructorId: req.params.Id,
      studentId: req.user.id,
    },
    defaults: {
      status: "pending",
    },
  });
  if (!student[1]) {
    return next(
      new AppError(
        "You have already sent a request to this instructor",
        StatusCodes.FORBIDDEN
      )
    );
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Request Sent To Instructor!",
  });
});

// Parents Childern
exports.addChild = catchAsync(async (req, res, next) => {
  await ParentStudent.create({
    parentId: req.user.id,
    studentId: req.params.Id,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Request Sent To Childern!",
  });
});

exports.getMyChildren = factory.getRequest(
  ParentStudent,
  "parentStudents",
  "parentId"
);

exports.acceptRequestByStudent = factory.acceptRequest(
  ParentStudent,
  "studentId"
);

exports.getMyRequests = factory.getRequest(
  ParentStudent,
  "parent",
  "studentId"
);

// User groups

exports.getUserGroup = factory.getAll(UserGroup);
exports.getUserGroupById = factory.getOne(UserGroup);
exports.createUserGroup = factory.createOne(UserGroup);
exports.updateUserGroup = factory.updateOne(UserGroup);
exports.deleteUserGroup = factory.deleteOne(UserGroup);

// User Group Users
exports.addUserToGroup = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ where: { id: req.params.Id } });
  if (!user) return next(new AppError("User Not Found", StatusCodes.NOT_FOUND));
  req.body.groupId = Array.isArray(req.body.groupId)
    ? req.body.groupId
    : req.body.groupId.split(",");
  const sendRequest = await user.addUserGroups(req.params.groupId);
  if (!sendRequest)
    return next(
      new AppError("User Already Added To This Group", StatusCodes.FORBIDDEN)
    );

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Request Sent To User !",
  });
});
exports.getMyGroupRequests = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ where: { id: req.user.id } });
  const userGroups = await user.getUserGroups({
    where: { status: "pending" },
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: userGroups,
  });
});
exports.acceptRequestByUser = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  await UserGroupSet.update({
    status: "accepted",
    where: {
      groupId,
      userId: req.user.id,
    },
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Request Accepted !",
  });
});
exports.declineRequestByUser = catchAsync(async (req, res, next) => {
  const { groupId } = req.body;
  await UserGroupSet.destroy({
    where: {
      groupId,
      userId: req.user.id,
    },
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "Request Declined !",
  });
});

// Bulk Upload Users

exports.uploadUsers = catchAsync(async (req, res, next) => {
  const users = await User.bulkCreate(req.data, {
    individualHooks: true,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    data: users,
  });
});
