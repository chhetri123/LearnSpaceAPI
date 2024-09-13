const { Op } = require("sequelize");
const operatorsAliases = {
  eq: Op.eq,
  ne: Op.ne,
  gte: Op.gte,
  gt: Op.gt,
  lte: Op.lte,
  lt: Op.lt,
  not: Op.not,
  in: Op.in,
  notIn: Op.notIn,
  is: Op.is,
};
exports.fiterOperator = (queryObj) => {
  for (let key in queryObj) {
    const fieldValue = Object.values(queryObj[key])[0];
    if (Object.keys(operatorsAliases).includes(Object.keys(queryObj[key])[0])) {
      queryObj[key] = {
        [operatorsAliases[Object.keys(queryObj[key])[0]]]: isNaN(fieldValue)
          ? fieldValue
          : +fieldValue,
      };
    } else {
      queryObj[key] = isNaN(queryObj[key]) ? queryObj[key] : +queryObj[key];
    }
  }
  return queryObj;
};
