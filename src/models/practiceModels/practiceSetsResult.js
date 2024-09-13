"use strict";
const { Model } = require("sequelize");
const { modelResultsOption } = require("../../utils/handlerModel");
module.exports = (sequelize, DataTypes) => {
  class practiceSetResultModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Question, { foreignKey: "questionId" });
      this.belongsTo(models.PracticeSet, { foreignKey: "practiceSetId" });
    }
  }
  practiceSetResultModel.init(
    {
      ...modelResultsOption,
      practiceSetId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Practice  Id is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "PracticeSetResult",
      tableName: "practice_sets_results",
    }
  );
  return practiceSetResultModel;
};

//
