"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class lessiosSetModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Skill, {
        foreignKey: "skillId",
        as: "skill",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.Subcategory, {
        foreignKey: "subCategoryId",
        as: "subCategory",
        onDelete: "CASCADE",
      });
      this.belongsToMany(models.Lession, {
        foreignKey: "lessionSetId",
        as: "lessions",
        through: "lessionlessionsets",
      });
      this.hasMany(models.TestSchedule, {
        foreignKey: "lessionSetId",
        as: "schedules",
        onDelete: "CASCADE",
      });
    }
  }
  lessiosSetModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      code: {
        type: DataTypes.STRING,
        defaultValue: "lessionSet_" + randomstring.generate(11),
      },
      subCategoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Sub category is required",
          },
        },
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Skill is required",
          },
        },
      },
      noOfLessions: {
        type: DataTypes.VIRTUAL,
        defaultValue: 0,
      },
    },

    {
      sequelize,
      tableName: "lessiossets",
      modelName: "LessionSet",
    }
  );
  lessiosSetModel.beforeFind((options) => {
    options.include = [
      {
        model: sequelize.models.Skill,
        as: "skill",
        attributes: ["id", "name", "code"],
      },
      {
        model: sequelize.models.Subcategory,
        as: "subCategory",
        attributes: ["id", "name", "code"],
      },
      ...(options.include || []),
    ];
  });
  return lessiosSetModel;
};
