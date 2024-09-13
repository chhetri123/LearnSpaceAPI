const { Comprehensive, Question } = require("../models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");
const {
  createOne,
  getAll,
  updateOne,
  deleteOne,
} = require("./handlerController");

exports.getAllComprehensive = getAll(Comprehensive);
exports.getComprehensive = catchAsync(async (req, res, next) => {
  const { Id } = req.params;
  const comprehensive = await Comprehensive.findByPk(Id, {
    include: [
      {
        model: Question,
        as: "comprehensiveQuestion",
        attributes: {
          exclude: ["createdAt", "updatedAt", "status", "comprehensiveId"],
        },
      },
    ],
  });
  if (!comprehensive) {
    return next(new AppError("No comprehensive found ", StatusCodes.NOT_FOUND));
  }
  res.status(StatusCodes.OK).json({
    status: "success",
    comprehensive,
  });
});

exports.createComprehensive = createOne(Comprehensive);
exports.updateComprehensive = updateOne(Comprehensive);
exports.deleteComprehensive = deleteOne(Comprehensive);
