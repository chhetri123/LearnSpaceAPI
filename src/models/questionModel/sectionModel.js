"use strict";
const { Model } = require("sequelize");
const { modelSubject } = require("./../../utils/handlerModel");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class sectionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.Skill, {
        foreignKey: "sectionId",
        as: "skills",
        onDelete: "CASCADE",
      });
    }
  }
  sectionModel.init(
    {
      ...modelSubject,
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "sec_" + randomstring.generate(11),
      },
    },
    {
      sequelize,
      modelName: "Section",
      tableName: "sections",
    }
  );
  sectionModel.addHook("beforeFind", (options) => {
    console.log("beforeFind", options);
  });
  return sectionModel;
};
