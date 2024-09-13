const crypto = require("crypto");
const { User, ResetToken } = require("./../models");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
// const Email = require("./../utils/email");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

//

const signToken = (id) => {
  console.log(process.env.JWT_SECRET_KEY);
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  // creating cookies
  const cookiesOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  cookiesOption.secure = process.env.NODE_ENV === "production" ? true : false;
  res.cookie("jwt", token, cookiesOption);
  // let profileCompleted = true;
  // if (user.role !== "admin") {
  //   if (!user.dob && !user.address && !user.education) {
  //     profileCompleted = false;
  //   }
  // }

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, role, password, passwordConfirm, gender } = req.body;
  const isUserExist = await User.findOne({ where: { email: email } });
  if (isUserExist)
    return next(new AppError("User already exist", StatusCodes.CONFLICT));
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    role: role.toLowerCase(),
    gender,
  });
  createSendToken(newUser.dataValues, StatusCodes.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // check password and email from request body is valid
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: email } });
  // check email & password exist or not
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError("Invalid Email or Password", StatusCodes.UNAUTHORIZED)
    );
  }
  // create token and send
  createSendToken(user.dataValues, StatusCodes.ACCEPTED, res);
});

//

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check of it is valid?
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError(
        "You are not logged in. Please login to get access",
        StatusCodes.UNAUTHORIZED
      )
    );

  // verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  // check if user still exixts
  const currentUser = await User.findByPk(decode.id);
  if (!currentUser)
    return next(
      new AppError("User belong to this token does no longer exist."),
      StatusCodes.UNAUTHORIZED
    );

  // check if user changed password after the token issued
  const isChanged = currentUser.changePasswordAfter(decode.iat);
  if (isChanged) {
    return next(
      new AppError("User recently changed password. Please login again !")
    );
  }
  // next

  req.user = currentUser;

  req.user = currentUser.dataValues;

  // if (req.user.role !== "admin") {
  //   if (!currentUser.dob && !currentUser.address && !currentUser.education) {
  //     const decodeId =
  //       Buffer.from(currentUser.id.toString()).toString("base64") +
  //       "." +
  //       randomstring.generate(11);
  //     res.cookie("profile_validation", decodeId, {
  //       expires: new Date(Date.now() + 2 * 86400 * 1000),
  //     });
  //     return res.status(StatusCodes.OK).json({
  //       status: "success",
  //       profileCompleted: false,
  //       user: currentUser,
  //     });
  //   }
  // }
  next();
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
exports.isLoggedIn = async (req, res, next) => {
  // getting token and check of it is valid?
  try {
    if (req.cookies.jwt) {
      // verification token

      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );
      // check if user still exixts
      const currentUser = await User.findByPk(decode.id);
      if (!currentUser) return next();

      // check if user changed password after the token issued
      const isChanged = currentUser.changePasswordAfter(decode.iat);
      if (isChanged) {
        return next();
      }
      // next
      res.locals.user = currentUser.dataValues;
      req.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to do this action",
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get user from POSTED email address
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user)
    return next(
      new AppError(
        "User doesn't exist in this Email address",
        StatusCodes.NOT_FOUND
      )
    );

  // Generate random token
  try {
    const resetToken = await user.createResetPasswordToken(user.id);
    // Send it to the mail,
    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/users/resetPassword/${resetToken}`;

    // await new Email(user, resetURL).sendPasswordReset();
    // console.log(resetURL);
    res.status(StatusCodes.OK).json({
      status: "success",
      resetToken: resetToken,
      message: "Reset token is valid for 10 minutes",
    });
  } catch (err) {
    await ResetToken.destroy({ where: { userID: user.id } });
    return next(
      new AppError(
        "There was an error sending a mail. Please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const token = await ResetToken.findOne({
    resetPasswordToken: resetToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!token)
    return next(
      new AppError("Invalid token or token epired", StatusCodes.NOT_FOUND)
    );

  const { dataValues: user } = await User.findOne({
    where: { id: token.userId },
  });
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  const updatedUser = await User.update(
    user,
    { where: { id: user.id }, individualHooks: true },
    { runValidators: true, returning: true }
  );
  const userAferReset = updatedUser[1][0].dataValues;
  await ResetToken.destroy({ where: { userId: user.id } });
  createSendToken(userAferReset, StatusCodes.OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const { currentPassword, password, passwordConfirm } = req.body;

  const user = await User.findByPk(req.user.id);

  // check if posted password is correct or not
  const isCorrectPassword = await user.correctPassword(
    currentPassword,
    user.password
  );
  if (!isCorrectPassword) {
    return next(
      new AppError("Current password is incorrect"),
      StatusCodes.UNAUTHORIZED
    );
  }
  if (currentPassword === password)
    return next(
      new AppError(
        "New Password Cannot be same as OldPassword .Please enter different password",
        StatusCodes.BAD_REQUEST
      )
    );

  // update password

  user.dataValues.password = password;
  user.dataValues.passwordConfirm = passwordConfirm;
  const { dataValues: userAfterUpdate } = await User.update(
    user.dataValues,
    { where: { id: user.id }, individualHooks: true },
    { runValidators: true }
  );
  // log user in jwt
  createSendToken(userAfterUpdate, StatusCodes.OK, res);
});
