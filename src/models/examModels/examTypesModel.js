"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class examTypeModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Exam, {
        foreignKey: "examtypeId",
        onDelete: "CASCADE",
      });
    }
  }
  examTypeModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "etp_" + randomstring.generate(11),
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
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ExamType",
      tableName: "exam_types",
    }
  );
  return examTypeModel;
};
