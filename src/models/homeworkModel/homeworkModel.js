"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class homeworkModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "instructorId" });
      this.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "categoryHomeworks",
      });
      this.belongsTo(models.Session, { as: "session" });
      this.hasMany(models.Group, {
        foreignKey: "homeworkId",
        as: "homework",
        onDelete: "SET NULL",
      });
      this.hasMany(models.HomeworkResult, {
        foreignKey: "homeworkId",
        onDelete: "SET NULL",
      });
      this.belongsToMany(models.Question, {
        through: "homework_questions",
        foreignKey: "homeworkId",
        otherKey: "questionId",
        references: {
          model: models.Question,
          key: "id",
        },
      });
      this.belongsToMany(models.User, {
        through: "individual_homeworks",
        foreignKey: "homeworkId",
        as: "individualHomeworks",
        otherKey: "studentId",
        required: false,
        references: {
          model: models.User,
          key: "id",
        },
      });
    }
  }
  homeworkModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Should be assigned by Instructor",
          },
        },
      },

      slug: {
        type: DataTypes.VIRTUAL,
        get() {
          if (!this.title) return null;
          return this.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "hw_" + randomstring.generate(11),
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        trim: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      attachment: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      attachmentPoint: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      quizPoint: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      totalQuestion: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("published", "private"),
        defaultValue: "published",
      },
    },
    {
      sequelize,
      modelName: "HomeWork",
      tableName: "homeworks",
    }
  );
  homeworkModel.afterFind((homework, options) => {
    if (homework && homework.length === 0) {
      homework = [homework];
    }
    if (homework && homework.length > 0) {
      homework.forEach((item) => {
        item.totalQuestion = item.Questions.length;
        console.log(item.Questions);
      });
    }
  });
  homeworkModel.beforeFind((options) => {
    options.include = {
      model: sequelize.models.Session,
      as: "session",
    };
    options.include = {
      model: sequelize.models.Question,
      through: sequelize.models.HomeworkQuestion,
      required: false,
    };
    // console.log(options);
  });
  return homeworkModel;
};

// add Hooks
