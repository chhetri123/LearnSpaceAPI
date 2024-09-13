"use strict";
const { Model } = require("sequelize");
const randomstring = require("randomstring");
const AppError = require("../../utils/appError");
module.exports = (sequelize, DataTypes) => {
  class videobanks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "ownerId",
        as: "owner",
      });
      this.belongsTo(models.Topic, {
        foreignKey: "topicId",
        as: "topic",
        onDelete: "Set null",
      });
      this.belongsTo(models.Skill, {
        foreignKey: "skillId",
        as: "skill",
        onDelete: "cascade",
      });
      this.belongsToMany(models.Tag, {
        through: "videobanks_tags",
        as: "tags",
        foreignKey: "videobankId",
        onDelete: "cascade",
      });
      this.belongsToMany(models.VideoSet, {
        through: "videosets_videos",
        as: "videosets",
        foreignKey: "videoId",
        onDelete: "cascade",
      });
    }
  }
  videobanks.init(
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
        defaultValue: "video_" + randomstring.generate(11),
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
      video_types: {
        type: DataTypes.ENUM,
        values: ["youtube", "vimeo", "upload"],
        allowNull: false,
      },
      video_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      videoId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      video_thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      topicId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM,
        values: ["very easy", "easy", "medium", "high", "very high"],
        allowNull: false,
      },
      watch_minutes: {
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
      modelName: "VideoBank",
      tableName: "videobanks",
    }
  );
  videobanks.beforeFind((options) => {
    options.include = [
      ...(options.include || []),
      {
        model: sequelize.models.Tag,
        as: "tags",
        attributes: ["id", "name", "code"],
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
  return videobanks;
};
