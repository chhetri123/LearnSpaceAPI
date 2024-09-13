"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class homwWorkQuestionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  homwWorkQuestionModel.init(
    {
      questionId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      homeworkId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "HomeworkQuestion",
      tableName: "homework_questions",
    }
  );
  return homwWorkQuestionModel;
};
