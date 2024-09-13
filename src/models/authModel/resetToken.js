"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ResetToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      this.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  ResetToken.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resetPasswordTokenExpires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ResetToken",
      tableName: "reset_tokens",
    }
  );
  return ResetToken;
};
