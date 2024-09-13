"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class videoSetvideo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  videoSetvideo.init(
    {
      videoId: DataTypes.UUID,
      videosetId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "VideoSetvideo",
      tableName: "videosets_videos",
    }
  );
  return videoSetvideo;
};
