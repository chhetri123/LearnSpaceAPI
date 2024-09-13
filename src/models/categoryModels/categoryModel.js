"use strict";
const { Model } = require("sequelize");
const { modelSubject } = require("./../../utils/handlerModel");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class categoryModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.Subcategory, {
        foreignKey: "categoryId",
        as: "subCategories",
        onDelete: "CASCADE",
      });
    }
  }
  categoryModel.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "cat_" + randomstring.generate(11),
      },
      ...modelSubject,
      slug: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.name
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        },
      },
      short_description: {
        type: DataTypes.STRING(100),
        allowNull: true,
        trim: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
    }
  );
  return categoryModel;
};
