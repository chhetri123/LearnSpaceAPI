"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class practiceSetQuestionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  practiceSetQuestionModel.init(
    {
      practiceSetId: {
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
      tableName: "practice_sets_questions",
      modelName: "PracticeSetsQuestion",
    }
  );
  return practiceSetQuestionModel;
};
