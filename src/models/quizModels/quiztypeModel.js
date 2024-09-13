"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class quizTypeModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Quiz, {
        foreignKey: "quiztypeId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  quizTypeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "qtp_" + randomstring.generate(11),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "QuizType",
      tableName: "quiz_types",
    }
  );
  return quizTypeModel;
};
