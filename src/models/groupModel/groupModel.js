"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");

module.exports = (sequelize, DataTypes) => {
  class groupModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, HomeWork, StudentGroup }) {
      // define association here
      this.belongsTo(User, {
        foreignKey: "instructorId",
      });
      this.belongsTo(HomeWork, {
        foreignKey: "homeworkId",
        as: "homework",
      });
      this.belongsToMany(User, {
        through: StudentGroup,
        foreignKey: "groupId",
        onDelete: "Cascade",
      });
    }
  }
  groupModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "group_" + randomstring.generate(11),
      },
      tagname: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      homeworkId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Group",
      tableName: "groups",
    }
  );
  return groupModel;
};
