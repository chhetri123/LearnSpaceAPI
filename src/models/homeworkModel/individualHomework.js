"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class individualHomeworkModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.User, {
        foreignKey: "studentId",
        as: "student",
      });
    }
  }
  individualHomeworkModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      homeworkId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      homeWorkAnswer: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      point: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      checkedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("Noting", "pending", "checking", "done"),
        allowNull: false,
        defaultValue: "Noting",
      },
    },
    {
      sequelize,
      tableName: "individual_homeworks",
      modelName: "IndividualHomework",
    }
  );
  return individualHomeworkModel;
};
