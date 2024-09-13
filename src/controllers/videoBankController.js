const {
  VideoBank,
  VideoSet,
  VideoSetVideo,
  Skill,
  Topic,
  Tag,
  Sequelize,
} = require("../models");
const catchAsync = require("../utils/catchAsync");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");
const ApiFeature = require("../utils/apiFeature");
const {
  updateOne,
  getAll,
  getOne,
  createOne,
  deleteOne,
  addSetIntoModel,
} = require("./handlerController");

// VideoBank
exports.getAllVideoBanks = getAll(VideoBank);
exports.getVideoBank = getOne(VideoBank);
exports.createVideoBank = catchAsync(async (req, res, next) => {
  const { video_link, videoId, video_types } = req.body;
  if (video_types === "youtube" || (video_types === "vimeo" && !videoId)) {
    return next(new AppError("Video ID is required", StatusCodes.BAD_REQUEST));
  }
  if (video_types === "upload" && !video_link) {
    return next(
      new AppError("Video link is required", StatusCodes.BAD_REQUEST)
    );
  }
  if (req.file)
    req.body.video_thumbnail = `/images/${req.file.filename[0].key}`;
  req.body.ownerId = req.user.id;
  const newVideoBank = await VideoBank.create(req.body);
  if (req.body.tags && req.body.tags.length > 0) {
    const tags = req.body.tags.split(",");
    await newVideoBank.addTags(tags);
  }
  res.status(StatusCodes.CREATED).json({
    status: "success",
    data: newVideoBank,
  });
});
exports.updateVideoBank = updateOne(VideoBank);
exports.deleteVideoBank = deleteOne(VideoBank);

exports.getVideoSets = catchAsync(async (req, res, next) => {
  const { condition } = new ApiFeature(req.query)
    .sort()
    .limitFields()
    .pagination();
  const videoSets = await VideoSet.findAll({
    ...condition,
    include: [
      {
        model: VideoBank,
        as: "videos",
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
      [Sequelize.fn("COUNT", Sequelize.col("videos.id")), "noOfVideos"],
      "subCategoryId",
      "createdAt",
      "updatedAt",
    ],
    group: ["VideoSet.id", "skill.id", "subCategory.id"],
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    results: videoSets.length,
    data: videoSets,
  });
});
exports.updateVideoSet = updateOne(VideoSet);
exports.deleteVideoSet = deleteOne(VideoSet);

exports.addVideoSet = addSetIntoModel(VideoSet);

exports.addVideoToSet = catchAsync(async (req, res, next) => {
  req.body.videoId = Array.isArray(req.body.videoId)
    ? req.body.videoId
    : req.body.videoId.split(",");

  const videoSet = await VideoSet.findOne({
    where: { id: req.params.Id },
  });
  if (!videoSet) return next(new AppError("video set not found", 404));
  const videos = await videoSet.addVideos(req.body.videoId);
  if (!videos) return next(new AppError("Videos cannot be added", 404));
  res.status(200).json({
    status: "success",
    msg: "Videos added Successfully",
  });
});

exports.getVideos = catchAsync(async (req, res, next) => {
  const videos = await VideoSet.findAll({
    where: { id: req.params.Id },
    include: [
      {
        model: VideoBank,
        as: "videos",
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
  if (!videos) return next(new AppError("Videos not found", 404));
  res.status(200).json({
    status: "success",
    data: {
      noOfVideos: videos[0].videos.length,
      ...videos[0].dataValues,
    },
  });
});

exports.removeVideoFromSet = catchAsync(async (req, res, next) => {
  const videoSet = await VideoSet.findOne({
    where: { id: req.params.Id },
  });
  if (!videoSet) return next(new AppError("Video set not found", 404));
  req.body.videoId = Array.isArray(req.body.videoId)
    ? req.body.videoId
    : [req.body.videoId];
  const videos = await videoSet.removeVideos([...req.body.videoId]);
  if (!videos) return next(new AppError("Video cannot be removed", 404));
  res.status(200).json({
    status: "success",
    msg: "Video removed Successfully",
  });
});

exports.searchVideo = catchAsync(async (req, res, next) => {
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
  const videos = await VideoBank.findAll({
    where: {
      ...where,
      id: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(SELECT "videoId" FROM videosets_videos WHERE "videosetId" = '${req.params.Id}')`
        ),
      },
    },
    ...condition,
  });
  res.status(200).json({
    status: "success",
    result: videos.length,
    data: videos,
  });
});
