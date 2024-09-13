"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class modelInstructorStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "studentId",
        as: "instructorStudents",
      });
      this.belongsTo(models.User, {
        foreignKey: "parentId",
        as: "instructor",
      });
    }
  }
  modelInstructorStudent.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "accepted", "rejected"],
      },
    },
    {
      sequelize,
      tableName: "instructor_students",
      modelName: "InstructorStudent",
    }
  );
  return modelInstructorStudent;
};
