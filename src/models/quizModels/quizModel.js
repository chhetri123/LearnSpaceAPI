"use strict";
const { Model, Sequelize } = require("sequelize");
const randomstring = require("randomstring");
const { modelSchema } = require("../../utils/handlerModel");
module.exports = (sequelize, DataTypes) => {
  class quizModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      this.belongsTo(models.Subcategory, {
        foreignKey: "subcategoryId",
        as: "subcategory",
      });
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "owner",
        onDelete: "Set Null",
      });
      this.belongsToMany(models.Question, {
        through: "quiz_set_questions",
        foreignKey: "quizId",
        as: "questions",
      });
      this.hasMany(models.QuizResult, { foreignKey: "quizId" });
      this.belongsTo(models.QuizType, {
        foreignKey: "quiztypeId",
        as: "quiztype",
      });
      this.hasMany(models.TestSchedule, {
        foreignKey: "quizId",
        as: "schedules",
        onDelete: "CASCADE",
      });
    }
  }

  quizModel.init(
    {
      ...modelSchema,
      quiztypeId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "quiz_" + randomstring.generate(11),
      },
    },
    {
      sequelize,
      modelName: "Quiz",
      tableName: "quizzes",
    }
  );
  quizModel.beforeFind(async (option) => {
    if (option.user?.role === "student") {
      option.where = {
        ...option.where,
        status: "active",
        visibility: "public",
      };
    }
    option.include = [
      {
        model: sequelize.models.Subcategory,
        as: "subcategory",
        attributes: ["id", "name"],
      },
      {
        model: sequelize.models.QuizType,
        as: "quiztype",
        attributes: ["id", "name"],
      },
      ...(option.include || []),
    ];
  });
  quizModel.addHook("afterFind", async (quizzes) => {
    if (quizzes && quizzes.length === undefined) {
      quizzes = [quizzes];
    }
    if (quizzes && quizzes.length > 0) {
      for (let i = 0; i < quizzes.length; i++) {
        const quiz = quizzes[i];
        const questions = await sequelize.models.QuizSetQuestion.findAll({
          where: {
            quizId: quiz.id,
          },
          attributes: {
            exclude: ["id"],
          },
        });
        const users = await sequelize.models.QuizResult.findAll({
          where: {
            quizId: quiz.id,
          },
          attributes: ["userId"],
        });
        quiz.totalQuestion = questions.length;
        quiz.totalMarks = quiz.point * quiz.totalQuestion;
        quiz.totalStudentsAssociated = users.length;
      }
    }
  });

  quizModel.beforeSave(async (quiz) => {
    if (quiz.price > 0) {
      quiz.available = "paid";
    }
  });

  quizModel.beforeSave(async (quizzes) => {
    if (!quizzes.isNegativeMark) {
      quizzes.negativeMark = 0;
    }
    if (!quizzes.isTimeBound) {
      quizzes.durations = null;
    }
  });

  return quizModel;
};
