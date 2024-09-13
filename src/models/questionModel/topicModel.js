"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
const { modelSubject } = require("../../utils/handlerModel");

module.exports = (sequelize, DataTypes) => {
  class topicModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Question, {
        foreignKey: "topicId",
        as: "questions",
        onDelete: "SET NULL",
      });
      this.belongsTo(models.Skill, {
        foreignKey: "skillId",
        as: "skill",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Lession, {
        foreignKey: "topicId",
        as: "lessions",
        onDelete: "SET NULL",
      });
      this.hasMany(models.VideoBank, {
        foreignKey: "topicId",
        as: "videoBanks",
        onDelete: "SET NULL",
      });
    }
  }
  topicModel.init(
    {
      ...modelSubject,
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "top_" + randomstring.generate(11),
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
      modelName: "Topic",
      tableName: "topics",
    }
  );
  topicModel.addHook("beforeFind", (options) => {
    options.include = {
      model: sequelize.models.Skill,
      as: "skill",
      attributes: ["id", "name", "code"],
    };
  });
  return topicModel;
};
