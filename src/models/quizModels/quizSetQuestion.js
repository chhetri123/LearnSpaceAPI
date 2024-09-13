"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuizSetQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QuizSetQuestion.init(
    {
      quizId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuizSetQuestion",
      tableName: "quiz_set_questions",
    }
  );
  return QuizSetQuestion;
};
