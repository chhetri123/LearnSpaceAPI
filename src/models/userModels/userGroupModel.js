"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class userGroupModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.User, {
        through: "user_group_sets",
        foreignKey: "groupId",
        as: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "owner",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      this.belongsToMany(models.TestSchedule, {
        through: "test_schedule_groups",
        as: "testSchedules",
        foreignKey: "userGroupId",
        onDelete: "cascade",
      });
    }
  }
  userGroupModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING,
        defaultValue: "ugp_" + randomstring.generate(11),
      },
      userGroupName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "User Group Name is required",
          },
          notEmpty: {
            msg: "User Group Name is required",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
        defaultValue: "active",
      },
      visibility: {
        type: DataTypes.ENUM,
        values: ["public", "private"],
        defaultValue: "private",
      },
    },
    {
      sequelize,
      tableName: "user_groups",
      modelName: "UserGroup",
    }
  );
  return userGroupModel;
};
