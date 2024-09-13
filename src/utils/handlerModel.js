const { DataTypes, Model } = require("sequelize");

exports.modelSchema = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notEmpty: {
        msg: "Title is required",
      },
    },
  },
  slug: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.title) return null;
      return this.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    },
  },
  isTimeBound: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Set Time Bound True or False",
      },
    },
  },
  durations: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    validate: {
      durationValidation() {
        if (this.isTimeBound && this.duration === null) {
          throw new Error("Must Provide Duration");
        }
      },
    },
  },
  subcategoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Subcategory is required",
      },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    trim: true,
  },
  point: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Point is required",
      },
    },
  },
  isNegativeMark: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Set Negative Mark True or False",
      },
    },
  },
  negativeMark: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      negativeMarkValidation() {
        if (this.isNegativeMark && this.negativeMark === 0) {
          throw new Error("Must Provide Nagetive Mark");
        }
      },
    },
  },
  price: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      userValidation() {
        if (this.price < 0) {
          throw new Error("Quiz price must be greater than 0");
        }
      },
    },
  },
  totalQuestion: {
    type: DataTypes.VIRTUAL,
    defaultValue: 0,
  },
  totalMarks: {
    type: DataTypes.VIRTUAL,
    defaultValue: 0,
  },
  totalStudentsAssociated: {
    type: DataTypes.VIRTUAL,
    defaultValue: 0,
  },
  available: {
    type: DataTypes.ENUM,
    values: ["free", "paid"],
    defaultValue: "free",
  },
  visibility: {
    type: DataTypes.ENUM,
    values: ["public", "private"],
    defaultValue: "private",
  },
  status: {
    type: DataTypes.ENUM,
    values: ["active", "inactive"],
    defaultValue: "active",
  },
};

//
exports.modelResultsOption = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Question is required",
      },
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  point: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  skill: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  yourAnswer: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  remark: {
    type: DataTypes.ENUM,
    values: ["correct", "incorrect"],
    allowNull: false,
  },
  time_taken: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  no_of_attempt: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  negativeMark: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
};

// Subject
exports.modelSubject = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notEmpty: {
        msg: "Name is required",
      },
    },
  },
  status: {
    type: DataTypes.ENUM,
    values: ["active", "inactive"],
    defaultValue: "active",
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    trim: true,
  },
};
