"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
module.exports = (sequelize, DataTypes) => {
  class lessionsModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Tag, {
        foreignKey: "lessionId",
        as: "tags",
        through: "lessiontags",
        onDelete: "CASCADE",
      });
      this.belongsTo(models.User, { foreignKey: "ownerId" });
      this.belongsTo(models.Skill, { foreignKey: "skillId", as: "skill" });
      this.belongsTo(models.Topic, {
        foreignKey: "topicId",
        as: "topic",
        onDelete: "SET NULL",
      });
      this.belongsToMany(models.LessionSet, {
        foreignKey: "lessionId",
        as: "lessionSets",
        through: "lessionlessionsets",
      });
    }
  }
  lessionsModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        defaultValue: "lession_" + randomstring.generate(11),
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title is required",
          },
          notEmpty: {
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
          notEmpty: {
            msg: "Body is required",
          },
        },
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      difficulty: {
        type: DataTypes.ENUM,
        values: ["very easy", "easy", "medium", "high", "very high"],
        allowNull: false,
      },
      read_minutes: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["active", "inactive"],
      },
    },

    {
      sequelize,
      modelName: "Lession",
      tableName: "lessions",
    }
  );
  lessionsModel.beforeFind((options) => {
    options.include = [
      {
        model: sequelize.models.Tag,
        as: "tags",
        attributes: ["id", "name"],
        through: {
          attributes: [],
        },
      },
      {
        model: sequelize.models.Skill,
        as: "skill",
        attributes: ["id", "name", "code"],
      },
      {
        model: sequelize.models.Topic,
        as: "topic",
        attributes: ["id", "name", "code"],
      },
    ];
  });

  return lessionsModel;
};
