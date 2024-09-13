"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class lessionTagModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  lessionTagModel.init(
    {
      lessionId: DataTypes.UUID,
      tagId: DataTypes.UUID,
    },
    {
      sequelize,
      tableName: "lessiontags",
      modelName: "LessionsTag",
    }
  );
  return lessionTagModel;
};
