"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class homeworkQuizResultModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.HomeworkResult, {
        foreignKey: "homeworkResultId",
        as: "homeworkResult",
      });
    }
  }
  homeworkQuizResultModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      homeworkResultId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      point: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      remark: {
        type: DataTypes.ENUM,
        values: ["correct", "incorrect"],
      },
      section: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      skill: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      yourAnswer: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "HomeworkQuizResult",
      tableName: "homework_quiz_results",
    }
  );
  return homeworkQuizResultModel;
};
