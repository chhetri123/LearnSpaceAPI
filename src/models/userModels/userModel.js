"use strict";

const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = (sequelize, DataTypes) => {
  class userModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.ResetToken, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Question, {
        foreignKey: "ownerId",
        onDelete: "SET NULL",
      });
      this.hasMany(models.Quiz, {
        foreignKey: "ownerId",
        onDelete: "SET NULL",
      });
      this.hasMany(models.QuizResult, { foreignKey: "userId" });

      this.hasMany(models.HomeWork, {
        foreignKey: "instructorId",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      this.hasMany(models.Group, {
        foreignKey: "instructorId",
        onDelete: "SET NULL",
      });

      this.belongsToMany(models.Group, {
        through: models.StudentGroup,
        foreignKey: "studentId",
        onDelete: "Cascade",
      });
      this.hasMany(models.StudentGroup, {
        foreignKey: "studentId",
      });
      this.hasMany(models.HomeworkResult, {
        foreignKey: "studentId",
        onDelete: "Cascade",
      });

      this.hasMany(models.PracticeSet, {
        foreignKey: "ownerId",
        onDelete: "Set null",
      });
      this.hasMany(models.PracticeSetResult, {
        foreignKey: "userId",
        onDelete: "SET NULL",
      });

      this.hasMany(models.Exam, {
        foreignKey: "ownerId",
        onDelete: "Set null",
      });

      this.hasMany(models.ExamResult, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
      this.hasMany(models.IndividualHomework, {
        foreignKey: "studentId",
        as: "student",
        onDelete: "CASCADE",
      });

      this.belongsTo(models.Meeting, {
        foreignKey: "meetingId",
        as: "meeting",
        onDelete: "SET NULL",
      });
      this.hasMany(models.ParentStudent, {
        foreignKey: "studentId",
        as: "parentStudents",
        useJunctionTable: false,
      });
      this.hasMany(models.ParentStudent, {
        foreignKey: "parentId",
        as: "parent",
        useJunctionTable: false,
      });
      this.hasMany(models.InstructorStudent, {
        foreignKey: "studentId",
        as: "instructorStudents",
        useJunctionTable: false,
      });
      this.hasMany(models.InstructorStudent, {
        foreignKey: "instructorId",
        as: "instructor",
        useJunctionTable: false,
      });

      this.hasMany(models.Lession, {
        foreignKey: "ownerId",
        onDelete: "SET NULL",
      });

      this.belongsToMany(models.UserGroup, {
        through: "user_group_sets",
        foreignKey: "userId",
        as: "groups",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      this.hasMany(models.UserGroup, {
        foreignKey: "ownerId",
        as: "owner",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }

    toJSON() {
      if (this.role === "student" || this.role === "parent") {
        return {
          ...this.get(),
          account_id: undefined,
          meetingtimeId: undefined,
          description: undefined,
          experience: undefined,
          skills: undefined,
          awards: undefined,
          certifications: undefined,
          location: undefined,
          hasMeetingSchedule: undefined,
          meetingId: undefined,
          meetingAmount: undefined,
        };
      }
      return this.get();
    }
  }

  userModel.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          notEmpty: {
            msg: "Your name is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Invalid email format",
          },
          notEmpty: {
            msg: "Email is required",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          len: { args: [8, 20], msg: "Password must be 8 to 20 characters" },
        },
      },
      passwordConfirm: {
        type: DataTypes.VIRTUAL,
        allowNull: true,
        validate: {
          userValidate() {
            if (this.password !== this.passwordConfirm) {
              throw new Error("Password and password confirm must be same");
            }
          },
        },
      },
      role: {
        type: DataTypes.ENUM,
        values: ["student", "admin", "teacher", "parent"],
        defaultValue: "student",
      },
      photo: {
        type: DataTypes.STRING,
        defaultValue: "/images/users/default.jpg",
      },
      gender: {
        type: DataTypes.ENUM,
        values: ["male", "female", "others"],
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      address: {
        type: DataTypes.STRING,
        length: {
          args: [5, 100],
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        validate: {
          is: /^\+?[0-9-]+$/,
        },
      },
      dob: {
        type: DataTypes.DATE,
        validate: {
          isDate: true,
          validator(value) {
            if (value > Date.now()) {
              throw new Error("Date of birth must be less than today");
            }
          },
        },
      },
      age: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.dob) {
            let today = new Date();
            let birthDate = new Date(this.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            let m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            return age;
          }
          return null;
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      occupation: {
        type: DataTypes.STRING,
      },
      education: {
        type: DataTypes.STRING,
      },
      account_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      about: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      skills: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      awards: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      certifications: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      languages: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meetingAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      hasMeeting: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      meetingId: {
        type: DataTypes.UUID,
        defaultValue: null,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );

  userModel.addHook("beforeCreate", async (user, options) => {
    user.password = await bcrypt.hash(user.password, 12);
    user.passwordConfirm = undefined;
  });
  userModel.addHook("beforeUpdate", async (user, options) => {
    if ([...user._changed].includes("password")) {
      user.password = await bcrypt.hash(user.password, 12);
      user.passwordConfirm = undefined;
      user.passwordChangedAt = Date.now() - 1000;
    }
  });

  userModel.beforeFind((options) => {
    options.where = { ...options.where, status: true };
  });
  userModel.afterCreate(async (user, options) => {
    if (user.role === "student" || user.role === "parent") {
      user.account_id = undefined;
      user.meetingtimeId = undefined;
      user.description = undefined;
      user.experience = undefined;
      user.skills = undefined;
      user.awards = undefined;
      user.certifications = undefined;
      user.location = undefined;
      user.hasMeetingSchedule = undefined;
      user.meetingId = undefined;
      user.meetingAmount = undefined;
    }
  });
  userModel.beforeBulkCreate(async (users, options) => {
    for (let i = 0; i < users.length; i++) {
      users[i].emailVerified =
        users[i].emailVerified.toLowerCase() === "no" ? false : true;
    }
  });

  userModel.prototype.correctPassword = async function (
    enteredPassword,
    savedPassword
  ) {
    return await bcrypt.compare(enteredPassword, savedPassword);
  };

  userModel.prototype.changePasswordAfter = function (JWT_IAT) {
    if (this.passwordChangedAt) {
      const changePasswordTime = this.passwordChangedAt.getTime() / 1000;
      return changePasswordTime > JWT_IAT;
    }

    return false;
  };
  userModel.prototype.createResetPasswordToken = async function (userId) {
    try {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
      await Reset_token.create({
        userId,
        resetPasswordToken,
        resetPasswordTokenExpires,
      });
      return resetToken;
    } catch (err) {
      throw new Error(err);
    }
  };
  userModel.beforeDestroy(async (user, options) => {
    await sequelize.models.Reset_token.destroy({ where: { userId: user.id } });
    // await sequelize.models.Meeting.destroy({ where: { userId: user.id } });
    await sequelize.models.Quiz.update(
      {
        status: "inactive",
        visibility: "private",
      },
      { where: { ownerId: user.id } }
    );
    await sequelize.models.PracticeSet.update(
      {
        status: "private",
        visibility: "private",
      },
      {
        where: {
          ownerId: user.id,
        },
      }
    );
  });

  return userModel;
};
