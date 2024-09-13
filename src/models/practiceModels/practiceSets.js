"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class practiceSetModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        onDelete: "Set null",
      });
      this.belongsToMany(models.Question, {
        through: models.PracticeSetsQuestion,
        foreignKey: "practiceSetId",
        otherKey: "questionId",
        references: {
          model: models.Question,
          key: "id",
        },
      });
      this.hasMany(models.PracticeSetResult, {
        foreignKey: "practiceSetId",
        as: "practiceResults",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Skill, {
        foreignKey: "skillId",
        as: "skill",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Subcategory, {
        foreignKey: "subcategoryId",
        as: "subcategory",
      });
      this.hasMany(models.TestSchedule, {
        foreignKey: "practicesetId",
        as: "schedules",
        onDelete: "CASCADE",
      });
    }
  }
  practiceSetModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "practice_" + randomstring.generate(11),
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
        },
      },
      subcategoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        trim: true,
        validate: {
          notEmpty: {
            msg: "Description is required",
          },
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      point: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 80,
        validate: {
          userValidate(value) {
            if (value < 0) {
              throw new Error("Point must be greater than 0");
            }
          },
        },
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      status: {
        type: DataTypes.ENUM("published", "private"),
        allowNull: false,
        defaultValue: "private",
        validate: {
          notEmpty: {
            msg: "Status is required",
          },
        },
      },

      totalQuestion: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
      totalMarks: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
      totalStudentsAssociated: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "PracticeSet",
      tableName: "practice_sets",
    }
  );
  practiceSetModel.afterFind(async (practices) => {
    if (practices && practices.length === undefined) {
      practices = [practices];
    }
    if (practices && practices.length > 0) {
      for (let i = 0; i < practices.length; i++) {
        const practice = practices[i];
        const questions = await sequelize.models.PracticeSetsQuestion.findAll({
          where: {
            practiceSetId: practice.id,
          },
        });
        const users = await sequelize.models.PracticeSetResult.findAll({
          where: {
            practiceSetId: practice.id,
          },
          attributes: ["userId"],
        });
        practice.totalStudentsAssociated = users.length;
        practice.totalQuestion = questions.length;
        practice.totalMarks = practice.point * practice.totalQuestion;
      }
    }
  });
  practiceSetModel.beforeFind((option) => {
    if (option.user === "student") {
      option.where = {
        ...option.where,
        status: "published",
      };
    }
    option.include = [
      {
        model: sequelize.models.Skill,
        as: "skill",
        attributes: ["id", "name"],
      },
      {
        model: sequelize.models.Subcategory,
        as: "subcategory",
        attributes: ["id", "name"],
      },
      ...(option.include || []),
    ];
  });
  practiceSetModel.beforeCreate((practiceSet) => {
    practiceSet.status = practiceSet.status.toLowerCase();
  });
  return practiceSetModel;
};
