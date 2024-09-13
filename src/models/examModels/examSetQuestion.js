"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class examSetQuestionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.ExamSection, {
        foreignKey: "examSectionId",
        as: "ExamSection",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Question, {
        foreignKey: "questionId",
        as: "question",
        onDelete: "CASCADE",
      });
    }
  }
  examSetQuestionModel.init(
    {
      examSectionId: {
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
      modelName: "ExamSectionQuestion",
      tableName: "exam_section_questions",
    }
  );
  return examSetQuestionModel;
};
