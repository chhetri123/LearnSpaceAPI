"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sessionModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    
      this.hasOne(models.HomeWork, {
        foreignKey: "sessionId",
        onDelete: "SET NULL",
      });
    }
  }
  sessionModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Start date is required",
          },
        },
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Due date is required",
          },
          userValidate(value) {
            if (value < this.startDate) {
              throw new Error("Due date must be greater than start date");
            }
          },
        },
      },
      duration: {
        type: DataTypes.VIRTUAL,
        get() {
          return (this.dueDate - this.startDate) / (1000 * 60 * 60);
        },
      },
      isExpire: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.dueDate < new Date();
        },
      },
    },
    {
      sequelize,
      modelName: "Session",
      tableName: "sessions",
    }
  );
  return sessionModel;
};
