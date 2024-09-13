"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class tagModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Question, {
        through: "questiontags",
        as: "questions",
        foreignKey: "tagId",
      });
      this.belongsToMany(models.Lession, {
        through: "lessiontags",
        as: "lessions",
        foreignKey: "tagId",
      });
      this.belongsToMany(models.VideoBank, {
        through: "videobanks_tags",
        as: "videoBanks",
        foreignKey: "tagId",
      });
    }
  }
  tagModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "tag_" + randomstring.generate(11),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Name is required",
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Tag",
      tableName: "tags",
    }
  );
  return tagModel;
};
