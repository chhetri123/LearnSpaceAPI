const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const utils = require("util");
const unlinkFile = utils.promisify(fs.unlink);
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { StatusCodes } = require("http-status-codes");
const { s3 } = require("./s3");
const multerS3 = require("multer-s3");

const setMulterStorage = (folder) => {
  return multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
    key: function (req, file, cb) {
      const filename = Date.now() + file.originalname;
      cb(null, `${folder}/${filename}`);
    },
  });
};

const setMulterFilter = (...ext) => {
  return (req, file, cb) => {
    if (ext.includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Not a valid file ! Please upload only valid file",
          StatusCodes.NOT_ACCEPTABLE
        ),
        false
      );
    }
  };
};
const uploadfile = multer({
  storage: setMulterStorage("homeworks"),
  fileFilter: setMulterFilter(
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "zip",
    "rar",
    "png",
    "jpg",
    "jpeg",
    "vnd.openxmlformats-officedocument.wordprocessingml.document"
  ),
});
const upload = multer({
  fileFilter: setMulterFilter("jpg", "jpeg", "png"),
  dest: "public/files/users",
});
const uploadQuestionsImage = multer({
  storage: setMulterStorage("questions"),
  fileFilter: setMulterFilter("jpg", "jpeg", "png"),
});
const uploadVideo = multer({
  storage: setMulterStorage("videosThumbnail"),
  fileFilter: setMulterFilter("jpg", "jpeg", "png"),
});

exports.uploadPhoto = upload.single("photo");
exports.uploadThumbnail = uploadVideo.single("video_thumbnail");
exports.fileUpload = uploadfile.array("file");
exports.questionUpload = uploadQuestionsImage.fields([
  { name: "option1", maxCount: 1 },
  { name: "option2", maxCount: 1 },
  { name: "option3", maxCount: 1 },
  { name: "option4", maxCount: 1 },
  { name: "option5", maxCount: 1 },
  { name: "option6", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

//
exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `users_${
    req.file.originalname.split(".")[0]
  }-${Date.now()}.jpeg`;
  const profileImage = sharp(req.file.path)
    .toFormat("jpeg")
    .jpeg({ quality: 90 });
  const uploadParams = {
    Bucket: `${process.env.S3_BUCKET_NAME}/users`,
    Key: req.file.filename,
    Body: profileImage,
    ContentType: "image/jpeg",
    ACL: "public-read",
  };
  const uploadImage = await s3.upload(uploadParams).promise();
  req.file.filename = `/images/${uploadImage.Key}`;
  await unlinkFile(req.file.path);
  next();
});

exports.fileRoutes = async (req, res, next) => {
  const keyfile = req.path.slice(1, req.path.length);
  console.log(keyfile);
  const downloadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: keyfile,
  };
  try {
    // const imageStream = s3.getObject(downloadParams).createReadStream();
    // imageStream.on("error", (err) => {
    //   res.status(StatusCodes.NOT_FOUND).json({
    //     status: "fail",
    //     message: "File not found",
    //   });
    // });
    // imageStream.pipe(res);
    // try {
    const data = await s3.getObject(downloadParams).promise();
    console.log(data.ContentType);
    res.setHeader("Content-Type", data.ContentType);
    res.send(data.Body);
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).json({
      status: "fail",
      message: "File not found",
    });
  }
};
