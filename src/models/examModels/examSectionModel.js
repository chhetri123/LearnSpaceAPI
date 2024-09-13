"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class examsections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Question, {
        through: "exam_section_questions",
        as: "questions",
        foreignKey: "examSectionId",
        otherKey: "questionId",
        references: {
          model: models.Question,
          key: "id",
        },
      });
    }
  }
  examsections.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Section name is required",
          },
        },
      },
      examId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sectionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      totalQuestion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalMarks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalDuration: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "ExamSection",
      tableName: "examsections",
    }
  );

  return examsections;
};
