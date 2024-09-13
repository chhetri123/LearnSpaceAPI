"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class modelParentsStudents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "studentId",
        as: "parentStudents",
      });
      this.belongsTo(models.User, {
        foreignKey: "parentId",
        as: "parent",
      });
    }
  }
  modelParentsStudents.init(
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
      parentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "accepted", "rejected"],
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      tableName: "parents_children",
      modelName: "ParentStudent",
    }
  );
  return modelParentsStudents;
};
