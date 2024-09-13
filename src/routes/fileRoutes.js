const express = require("express");
const { fileRoutes } = require("./../middlewares/fileHandler");

const router = express.Router();
router.route("/*").get(fileRoutes);

module.exports = router;
