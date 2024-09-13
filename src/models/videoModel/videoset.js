"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class videosetModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Skill, {
        foreignKey: "skillId",
        as: "skill",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Subcategory, {
        foreignKey: "subCategoryId",
        as: "subCategory",
        onDelete: "CASCADE",
      });
      this.belongsToMany(models.VideoBank, {
        foreignKey: "videosetId",
        as: "videos",
        through: "videosets_videos",
      });
      this.hasMany(models.TestSchedule, {
        foreignKey: "videoSetId",
        as: "schedules",
        onDelete: "CASCADE",
      });
    }
  }
  videosetModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      code: {
        type: DataTypes.STRING,
        defaultValue: "videoSet_" + randomstring.generate(11),
      },
      subCategoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Sub category is required",
          },
        },
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Skill is required",
          },
        },
      },
    },

    {
      sequelize,
      tableName: "videosets",
      modelName: "VideoSet",
    }
  );
  videosetModel.beforeFind((options) => {
    options.include = [
      {
        model: sequelize.models.Skill,
        as: "skill",
        attributes: ["id", "name", "code"],
      },
      {
        model: sequelize.models.Subcategory,
        as: "subCategory",
        attributes: ["id", "name", "code"],
      },
      ...(options.include || []),
    ];
  });
  return videosetModel;
};
