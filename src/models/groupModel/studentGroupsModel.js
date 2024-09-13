"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class studentGroupsModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      this.belongsTo(User, {
        foreignKey: "studentId",
      });
    }
  }
  studentGroupsModel.init(
    {
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      groupId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      homeWorkAnswer: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "StudentGroup",
      tableName: "group_set_students",
    }
  );
  return studentGroupsModel;
};
