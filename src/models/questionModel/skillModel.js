"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");

const { modelSubject } = require("./../../utils/handlerModel");
module.exports = (sequelize, DataTypes) => {
  class skillModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Question, {
        foreignKey: "skillId",
        as: "questions",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Section, {
        foreignKey: "sectionId",
        as: "section",
        onDelete: "CASCADE",
      });

      this.hasMany(models.Topic, {
        foreignKey: "skillId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Lession, {
        foreignKey: "skillId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.LessionSet, {
        foreignKey: "skillId",
        as: "lessionSets",
        onDelete: "CASCADE",
      });
      this.hasMany(models.PracticeSet, {
        foreignKey: "skillId",
        as: "practiceSets",
        onDelete: "CASCADE",
      });
      this.hasMany(models.VideoBank, {
        foreignKey: "skillId",
        as: "videoBanks",
        onDelete: "CASCADE",
      });
    }
  }
  skillModel.init(
    {
      ...modelSubject,
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "skill_" + randomstring.generate(11),
      },
      sectionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Skill",
      tableName: "skills",
    }
  );

  skillModel.addHook("beforeFind", (options) => {
    options.include = {
      model: sequelize.models.Section,
      as: "section",
      attributes: ["id", "name", "code"],
    };
  });
  return skillModel;
};
