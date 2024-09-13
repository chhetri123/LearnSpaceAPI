"use strict";
const { Model, Sequelize } = require("sequelize");
const { modelSchema } = require("../../utils/handlerModel");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class examModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.ExamType, {
        foreignKey: "examtypeId",
        as: "examType",
      });
      this.belongsTo(models.User, { foreignKey: "ownerId" });

      this.hasMany(models.ExamResult, {
        foreignKey: "examId",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Subcategory, {
        foreignKey: "subcategoryId",
        as: "examSubcategory",
      });

      this.hasMany(models.ExamSection, {
        foreignKey: "examId",
        as: "examSections",
        onDelete: "CASCADE",
      });

      this.belongsToMany(models.Section, {
        through: models.ExamSection,
        // as: "examSections",
        foreignKey: "examId",
        otherKey: "sectionId",
        references: {
          model: models.Section,
          key: "id",
        },
      });
      this.hasMany(models.TestSchedule, {
        foreignKey: "examId",
        as: "schedules",
        onDelete: "CASCADE",
      });
    }
  }
  examModel.init(
    {
      ...modelSchema,
      totalSection: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "exam_" + randomstring.generate(11),
      },
      examtypeId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Exam",
      tableName: "exams",
    }
  );

  examModel.beforeFind((options) => {
    if (options.role === "student") {
      options.where = {
        ...options.where,
        status: "active",
        visibility: "public",
      };
    }
    options.include = [
      ...(options.include ? options.include : []),

      {
        model: sequelize.models.ExamType,
        as: "examType",
        attributes: ["name", "id", "code"],
      },
      {
        model: sequelize.models.Subcategory,
        as: "examSubcategory",
        attributes: ["name", "id", "code"],
      },
    ];
  });
  examModel.afterFind(async (exams) => {
    if (exams && exams.length === undefined) {
      exams = [exams];
    }
    // console.log();
    if (exams && exams.length > 0) {
      for (let i = 0; i < exams.length; i++) {
        const exam = exams[i];
        const questions = await sequelize.models.ExamSection.findAll({
          where: {
            examId: exam.id,
          },
          attributes: [
            [
              sequelize.fn("SUM", sequelize.col("totalQuestion")),
              "totalQuestion",
            ],
            [sequelize.fn("count", sequelize.col("id")), "totalSection"],
            [sequelize.fn("SUM", sequelize.col("totalMarks")), "totalMarks"],
            [sequelize.fn("SUM", sequelize.col("totalDuration")), "totalTime"],
          ],
        });
        const users = await sequelize.models.ExamResult.findAll({
          where: {
            examId: exam.id,
          },
          attributes: ["userId"],
        });

        exam.totalQuestion = +questions[0].dataValues.totalQuestion;
        exam.totalMarks = exam.point * exam.totalQuestion;
        exam.totalStudentsAssociated = users.length;
        exam.totalSection = +questions[0].dataValues.totalSection;
      }
    }
  });

  examModel.beforeSave(async (exam) => {
    if (exam.price > 0) {
      exam.available = "paid";
    }
  });
  examModel.beforeSave(async (exam) => {
    if (!exam.isNegativeMark) {
      exam.negativeMark = 0;
    }
    if (!exam.isTimeBound) {
      exam.durations = null;
    }
  });
  examModel.beforeUpdate(async (exam) => {
    if (exam.dataValues.price > 0) {
      exam.dataValues.available = "paid";
    }
  });
  return examModel;
};
