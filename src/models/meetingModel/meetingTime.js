"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class meetingTimeModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Meeting, {
        foreignKey: "meetingId",
        as: "meetingTimes",
      });
    }
  }
  meetingTimeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      meetingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      meeting_type: {
        type: DataTypes.ENUM("in_person", "online"),
        defaultValue: "in_person",
      },
      day_label: {
        type: DataTypes.ENUM(
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ),
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATE,
      },
      time: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      tableName: "meeting_times",
      modelName: "MeetingTime",
    }
  );
  return meetingTimeModel;
};
