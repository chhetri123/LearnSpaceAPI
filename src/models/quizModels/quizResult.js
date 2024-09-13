"use strict";
const { Model } = require("sequelize");
const { modelResultsOption } = require("../../utils/handlerModel");
module.exports = (sequelize, DataTypes) => {
  class QuizResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Question, Quiz }) {
      // define association here

      this.belongsTo(User, { foreignKey: "userId" });
      this.belongsTo(Question, { foreignKey: "questionId" });
      this.belongsTo(Quiz, { foreignKey: "quizId" });
    }
  }
  QuizResult.init(
    {
      ...modelResultsOption,
      quizId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuizResult",
      tableName: "quiz_results",
    }
  );

  return QuizResult;
};
