"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class scheduleModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Exam, { foreignKey: "examId" });
      this.belongsTo(models.Quiz, { foreignKey: "quizId" });
      this.belongsTo(models.PracticeSet, { foreignKey: "practicesetId" });
      this.belongsTo(models.VideoSet, { foreignKey: "videoSetId" });
      this.belongsTo(models.LessionSet, { foreignKey: "lessionSetId" });
      this.belongsToMany(models.UserGroup, {
        through: "test_schedule_groups",
        as: "userGroups",
        foreignKey: "scheduleId",
        onDelete: "cascade",
      });
    }
    toJSON() {
      if (this.type === "fixed") {
        this.endDate = undefined;
        this.endTime = undefined;
      }
      [
        "quizId",
        "examId",
        "practicesetId",
        "videoSetId",
        "lessionSetId",
      ].forEach((el) => {
        if (this[el] === null) {
          this[el] = undefined;
        }
      });
      return { ...this.get() };
    }
  }
  scheduleModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quizId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      examId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      practicesetId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      videoSetId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      lessionSetId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["fixed", "flexible"],
        allowNull: false,
        defaultValue: "fixed",
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      grace_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "expired", "cancelled"],
      },
    },
    {
      sequelize,
      modelName: "TestSchedule",
      tableName: "test_schedules",
    }
  );

  scheduleModel.beforeCreate((schedule, options) => {
    if (schedule.quizId) schedule.code = "qsd_" + randomstring.generate(11);
    if (schedule.examId) schedule.code = "esd_" + randomstring.generate(11);
    if (schedule.practicesetId)
      schedule.code = "psd_" + randomstring.generate(11);
    if (schedule.videoSetId) schedule.code = "vsd_" + randomstring.generate(11);
    if (schedule.lessionSetId)
      schedule.code = "lsd_" + randomstring.generate(11);

    if (schedule.type === "fixed") {
      schedule.endDate = null;
      schedule.endTime = null;
    }
  });

  return scheduleModel;
};
