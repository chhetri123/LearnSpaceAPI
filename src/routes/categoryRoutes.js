const express = require("express");
const auth = require("./../middlewares/auth");
const categoryController = require("./../controllers/categoryController");

const router = express.Router();

router.use(auth.protect);
router
  .route("/category")
  .get(categoryController.getAllCategory)
  .post(auth.restrictTo("admin", "teacher"), categoryController.addCategory);

router
  .route("/category/:Id")
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory)
  .get(categoryController.getCategory);

router
  .route("/subcategory")
  .get(categoryController.getAllSubcategory)
  .post(auth.restrictTo("admin", "teacher"), categoryController.addSubcategory);

router
  .route("/subcategory/:Id")
  .patch(categoryController.updateSubcategory)
  .delete(categoryController.deleteSubcategory)
  .get(categoryController.getSubcategory);

// quiz type
module.exports = router;
