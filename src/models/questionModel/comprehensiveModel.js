"use strict";
const { Model, UUID } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class comprehensiveModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Question, {
        foreignKey: "comprehensiveId",
        as: "comprehensiveQuestion",
      });
    }
  }
  comprehensiveModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "comp_" + randomstring.generate(11),
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required",
          },
        },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Body is required",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Comprehensive",
      tableName: "comprehensives_passage",
    }
  );


  return comprehensiveModel;
};
