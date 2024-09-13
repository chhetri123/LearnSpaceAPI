const XLSX = require("xlsx");
const multer = require("multer");
const multerStorage = multer.memoryStorage();
const AppError = require("./../utils/appError");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("./../utils/catchAsync");
const fs = require("fs");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not a Excel ! Please upload only Excel file",
        StatusCodes.NOT_ACCEPTABLE
      ),
      false
    );
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const imagePath = `public/files/question/${req.user.id
      .split("-")
      .join("")}_questions`;

    fs.mkdirSync(imagePath, { recursive: true });
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    new AppError("Only .png, .jpg and .jpeg format allowed!");
    err.name = "ExtensionError";
    return cb(err);
  }
};

const uploadFile = multer({ storage: multerStorage, fileFilter: excelFilter });
const uploadImage = multer({ storage: storage, fileFilter: fileFilter });

exports.uploadFiles = uploadFile.single("file");
exports.uploadImages = uploadImage.array("images");

//
exports.bulkDataUpload = catchAsync(async (req, res, next) => {
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  // Get the first sheet in the workbook
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Convert the sheet data to an object
  const data = XLSX.utils.sheet_to_json(sheet);
  // Send the data to the client
  req.data = data;
  next();
});
