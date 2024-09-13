"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class meetingModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.MeetingTime, {
        foreignKey: "meetingId",
        as: "meetingTimes",
        onDelete: "CASCADE",
      });
      this.hasOne(models.User, {
        foreignKey: "meetingId",
        as: "meeting",
        onDelete: "SET NULL",
      });
    }
  }
  meetingModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      in_person: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Meeting",
      tableName: "meetings",
    }
  );

  meetingModel.addHook("beforeDestroy", async (meeting, options) => {
    await sequelize.models.User.update(
      {
        meetingAmount: null,
        hasMeeting: false,
      },
      {
        where: { meetingId: meeting.id },
      }
    );
    console.log("From destroy hook");
  });
  return meetingModel;
};
