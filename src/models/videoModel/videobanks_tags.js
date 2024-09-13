"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class videobanks_tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  videobanks_tags.init(
    {
      videobankId: DataTypes.UUID,
      tagId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "VideoBankTag",
      tableName: "videobanks_tags",
    }
  );
  return videobanks_tags;
};
