"use strict";
const { Model } = require("sequelize");
const { modelSubject } = require("../../utils/handlerModel");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class subcategoryModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Category, {
        foreignKey: "categoryId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Quiz, {
        foreignKey: "subcategoryId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Exam, {
        foreignKey: "subcategoryId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.LessionSet, {
        foreignKey: "subCategoryId",
        onDelete: "CASCADE",
        as: "lessionSets",
      });
      this.hasMany(models.PracticeSet, {
        foreignKey: "subcategoryId",
        onDelete: "CASCADE",
        as: "practiceSets",
      });
    }
  }
  subcategoryModel.init(
    {
      ...modelSubject,
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "sub_" + randomstring.generate(11),
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Category is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Subcategory",
      tableName: "subcategories",
    }
  );

  return subcategoryModel;
};
