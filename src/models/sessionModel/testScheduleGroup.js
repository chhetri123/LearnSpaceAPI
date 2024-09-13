"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class testScheduleGroupModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  testScheduleGroupModel.init(
    {
      scheduleId: DataTypes.UUID,
      userGroupId: DataTypes.UUID,
    },
    {
      sequelize,
      tableName: "test_schedule_groups",
      modelName: "TestScheduleGroup",
    }
  );
  return testScheduleGroupModel;
};
