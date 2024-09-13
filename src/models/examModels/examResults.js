"use strict";
const { Model } = require("sequelize");
const { modelResultsOption } = require("../../utils/handlerModel");
module.exports = (sequelize, DataTypes) => {
  class examResultModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Question, { foreignKey: "questionId" });
      this.belongsTo(models.Exam, { foreignKey: "examId" });
    }
  }
  examResultModel.init(
    {
      ...modelResultsOption,
      examId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ExamResult",
      tableName: "exam_results",
    }
  );
  return examResultModel;
};
