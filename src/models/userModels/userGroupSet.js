"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_group_sets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_group_sets.init(
    {
      userId: DataTypes.UUID,
      groupId: DataTypes.UUID,
      status: {
        type: DataTypes.ENUM,
        values: ["accepted", "pending"],
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "UserGroupSet",
      tableName: "user_group_sets",
    }
  );
  return user_group_sets;
};
