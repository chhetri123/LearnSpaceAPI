"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class requestMeetingModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  requestMeetingModel.init(
    {
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RequestMeeting",
      tableName: "request_meetings",
    }
  );
  return requestMeetingModel;
};
