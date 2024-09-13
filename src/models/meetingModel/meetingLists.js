"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class meetingListModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  meetingListModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      meetingType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      studentsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("waiting", "finsihed", "canceled", "progress"),
        defaultValue: "waiting",
      },
    },
    {
      sequelize,
      tableName: "meeting_lists",
      modelName: "MeetingList",
    }
  );
  return meetingListModel;
};
