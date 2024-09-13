"use strict";
const { Model, Sequelize } = require("sequelize");
const { setQuestionType } = require("../../utils/questionTypeSelection");

const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class questionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "ownerId" });
      this.belongsTo(models.Skill, { foreignKey: "skillId", as: "skill" });
      this.hasMany(models.QuizResult, { foreignKey: "questionId" });
      this.hasMany(models.PracticeSetResult, {
        foreignKey: "questionId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.ExamResult, {
        foreignKey: "questionId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.ExamSectionQuestion, {
        foreignKey: "questionId",
        as: "examSectionQuestions",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Topic, {
        foreignKey: "topicId",
        as: "topic",
        onDelete: "SET NULL",
      });
      this.belongsToMany(models.Tag, {
        foreignKey: "questionId",
        as: "tags",
        through: "questiontags",
        onDelete: "CASCADE",
      });
      this.belongsToMany(models.Quiz, {
        foreignKey: "questionId",
        as: "quizzes",
        through: "quiz_set_questions",
      });
      this.belongsTo(models.Comprehensive, {
        foreignKey: "comprehensiveId",
        as: "comprehensive",
        onDelete: "SET NULL",
      });
    }
  }

  questionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          notEmpty: {
            msg: "Question is required",
          },
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "que_" + randomstring.generate(11),
      },
      type_code: {
        type: DataTypes.ENUM,
        values: ["MSA", "MMA", "TOF", "SAQ", "MTF", "ORB", "FIB"],
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Question type is required",
          },
        },
      },
      type: {
        type: DataTypes.VIRTUAL,
        get() {
          return setQuestionType(this.type_code);
        },
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Skill is required",
          },
        },
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      answers: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
          answersValidation() {
            if (this.answers.length < 4) {
              throw new Error("At least 4 options are required");
            }
          },
        },
      },
      correct_answers: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        validate: {
          correctAnswersValidation() {
            if (this.correct_answers.length === 0) {
              throw new Error("Correct answer is required");
            }
            this.correct_answers.forEach((answer) => {
              if (!this.answers.includes(answer)) {
                throw new Error("Correct answer must be one of the options");
              }
            });
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true,
        defaultValue: null,
      },
      hasSolutionDescription: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      default_mark: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
      },
      default_time: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 60,
      },
      description: {
        type: DataTypes.STRING,
      },
      attachment_type: {
        type: DataTypes.ENUM,
        values: ["passage", "video", "audio"],
        defaultValue: null,
      },
      comprehensiveId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      videoId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      audioId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      solutiondescription: {
        type: DataTypes.TEXT,
        get() {
          if (this.hasSolutionDescription) {
            if (this.getDataValue("solutiondescription").length < 0) {
              throw new Error("Solution description is required");
            }
          } else {
            return null;
          }
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true,
        defaultValue: null,
      },
      difficulty: {
        type: DataTypes.ENUM,
        values: ["very easy", "easy", "medium", "high", "very high", "expert"],
        defaultValue: "easy",
      },
      hint: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
        defaultValue: "active",
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Question",
      tableName: "questions",
    }
  );
  questionModel.beforeFind(async (question) => {
    if (question.where && question.where.answers) {
      question.where.answers = {
        [Sequelize.Op.contains]: [question.where.answers],
      };
    }
    if (question.where && question.where.correct_answers) {
      question.where.correct_answers = {
        [Sequelize.Op.contains]: [question.where.correct_answers],
      };
    }
    question.include = [
      {
        model: sequelize.models.Skill,
        as: "skill",
        attributes: ["name", "id", "code"],
      },
      {
        model: sequelize.models.Topic,
        as: "topic",
        attributes: ["name", "id", "code"],
      },
      {
        model: sequelize.models.Tag,
        as: "tags",
        through: {
          model: sequelize.models.QuestionTag,
          attributes: [],
        },
        attributes: ["id", "name"],
      },
    ];
  });
  questionModel.beforeCreate(async (question, option) => {
    question.type_code = question.type_code.trim().toUpperCase();
    question.difficulty = question.difficulty.trim().toLowerCase();
  });
  questionModel.prototype.checkAnswer = async (yourAnswer, answers) => {
    return yourAnswer.every((answer) => answers.includes(answer))
      ? "correct"
      : "incorrect";
  };

  return questionModel;
};
