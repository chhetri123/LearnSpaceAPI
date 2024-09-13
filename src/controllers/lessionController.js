const {
  Lession,
  LessionSet,
  Skill,
  Topic,
  Tag,
  Sequelize,
} = require("../models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiFeature = require("../utils/apiFeature");
const {
  addSetIntoModel,
  updateOne,
  getAll,
  getOne,
  deleteOne,
  createOne,
} = require("./handlerController");

exports.addLession = createOne(Lession);
exports.getAllLessions = getAll(Lession);
exports.updateLession = updateOne(Lession);
exports.deleteLession = deleteOne(Lession);
exports.getLession = getOne(Lession);

exports.getLessionSets = getAll(LessionSet, {
  include: [
    {
      model: Lession,
      as: "lessions",
      attributes: [],
      through: {
        attributes: [],
      },
    },
  ],
  attributes: [
    "id",
    "code",
    "skillId",
    [Sequelize.fn("COUNT", Sequelize.col("lessions.id")), "noOfLessions"],
    "subCategoryId",
    "createdAt",
    "updatedAt",
  ],
  group: ["LessionSet.id", "skill.id", "subCategory.id"],
});
exports.updateLessionSet = updateOne(LessionSet);
exports.deleteLessionSet = deleteOne(LessionSet);
exports.addLessionSet = addSetIntoModel(LessionSet);

exports.addLessionToSet = catchAsync(async (req, res, next) => {
  const lessionSet = await LessionSet.findOne({
    where: { id: req.params.Id },
  });
  if (!lessionSet) return next(new AppError("Lession set not found", 404));
  req.body.lessionId = Array.isArray(req.body.lessionId)
    ? req.body.lessionId
    : [req.body.lessionId];
  const lessions = await lessionSet.addLessions([...req.body.lessionId]);
  if (!lessions) return next(new AppError("Lessions cannot be added", 404));
  res.status(200).json({
    status: "success",
    msg: "Lessions added Successfully",
  });
});

exports.getLessions = catchAsync(async (req, res, next) => {
  const lessions = await LessionSet.findAll({
    where: { id: req.params.Id },
    include: [
      {
        model: Lession,
        as: "lessions",
        through: {
          attributes: [],
        },
        include: [
          {
            model: Skill,
            as: "skill",
            attributes: ["id", "name"],
          },
          {
            model: Topic,
            as: "topic",
            attributes: ["id", "name"],
          },
          {
            model: Tag,
            as: "tags",
            attributes: ["id", "name"],
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  });
  if (!lessions) return next(new AppError("Lessions not found", 404));
  res.status(200).json({
    status: "success",
    data: {
      noOfLessions: lessions[0].lessions.length,
      ...lessions[0].dataValues,
    },
  });
});

exports.removeLessionFromSet = catchAsync(async (req, res, next) => {
  const lessionSet = await LessionSet.findOne({
    where: { id: req.params.Id },
  });
  if (!lessionSet) return next(new AppError("Lession set not found", 404));
  req.body.lessionId = Array.isArray(req.body.lessionId)
    ? req.body.lessionId
    : [req.body.lessionId];
  const lessions = await lessionSet.removeLessions([...req.body.lessionId]);
  if (!lessions) return next(new AppError("Lessions cannot be removed", 404));
  res.status(200).json({
    status: "success",
    msg: "Lessions removed Successfully",
  });
});

exports.searchLession = catchAsync(async (req, res, next) => {
  const { condition } = new ApiFeature(req.query)
    .sort()
    .limitFields()
    .pagination();

  if (!condition.attributes) {
    condition.attributes = {
      exclude: ["ownerId", "status", "createdAt", "updatedAt"],
    };
  }
  const { where } = condition;
  delete condition.where;
  const lessions = await Lession.findAll({
    where: {
      ...where,
      id: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(SELECT "lessionId" FROM lessionlessionsets WHERE "lessionSetId" = '${req.params.Id}')`
        ),
      },
    },
    ...condition,
  });
  res.status(200).json({
    status: "success",
    result: lessions.length,
    data: lessions,
  });
});
