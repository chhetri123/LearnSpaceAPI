"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class lessiosLessionSet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  lessiosLessionSet.init(
    {
      lessionSetId: DataTypes.UUID,
      lessionId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "LessiosLessionSet",
      tableName: "lessionlessionsets",
    }
  );
  return lessiosLessionSet;
};
