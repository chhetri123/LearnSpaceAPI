"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class homeworkResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "studentId",
        as: "user",
      });
      this.hasMany(models.HomeworkQuizResult, {
        foreignKey: "homeworkResultId",
        as: "homeworkQuizResult",
      });
    }
  }
  homeworkResult.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      homeworkId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      attachmentPoint: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      attachmentAnswer: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("checking", "done"),
        allowNull: false,
        defaultValue: "checking",
      },
    },
    {
      sequelize,
      tableName: "homework_results",
      modelName: "HomeworkResult",
    }
  );
  return homeworkResult;
};
