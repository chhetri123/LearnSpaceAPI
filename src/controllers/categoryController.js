const { Category, Subcategory } = require("./../models");
const {
  createOne,
  updateOne,
  getAll,
  getOne,
  deleteOne,
} = require("./handlerController");

exports.addCategory = createOne(Category);
exports.getAllCategory = getAll(Category);
exports.updateCategory = updateOne(Category);
exports.deleteCategory = deleteOne(Category);
exports.getCategory = getOne(Category);

//Subcategory
exports.addSubcategory = createOne(Subcategory);
exports.getAllSubcategory = getAll(Subcategory);
exports.updateSubcategory = updateOne(Subcategory);
exports.deleteSubcategory = deleteOne(Subcategory);
exports.getSubcategory = getOne(Subcategory);
