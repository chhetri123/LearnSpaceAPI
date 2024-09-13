const { fiterOperator } = require("./filterProperties");

class ApiFeature {
  constructor(
    query,
    condition = {
      where: {},
    }
  ) {
    this.query = query;
    this.condition = condition;
  }
  filter() {
    const excludeFields = ["page", "sort", "limit", "fields"];
    const queryObj = { ...this.query };
    excludeFields.forEach((item) => delete queryObj[item]);
    this.condition.where = fiterOperator(queryObj);

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(",");
      const sortedArray = sortBy.map((item) =>
        item.startsWith("-") ? [item.slice(1), "DESC"] : [item, "ASC"]
      );
      this.condition.order = [sortedArray];
    }
    return this;
  }
  limitFields() {
    if (this.query.fields) {
      const queryFields = this.query.fields.split(",");
      this.condition.attributes = queryFields;
    }
    return this;
  }
  pagination() {
    if (this.query.limit || this.query.page) {
      const page = +this.query.page || 1;
      const limit = +this.query.limit || 10;
      const skip = (page - 1) * limit;
      this.condition.limit = limit;
      this.condition.offset = skip;
    }
    return this;
  }
}
module.exports = ApiFeature;
