const { MONGO_DB_CONFIG } = require("../config/app.config");
const Category = require("../models/Category");
async function createCategory(params, callback) {
  if (!params.name) {
    return callback(
      {
        message: "Category name is required",
      },
      ""
    );
  }
  const model = new Category(params);
  model
    .save()
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}
async function getCategories(params, callback) {
  const categoryName = params.name;
  var condition = categoryName
    ? {
      name: { $regex: new RegExp(categoryName), $options: "i" },
    }
    : {};
  let perPage = Math.ads(params.pageSize) || MONGO_DB_CONFIG.PAGE_SIZE;
  let page = (Math.abs(params.page) || 1) - 1;
  Category.find(condition, "name")
    .limit(perPage)
    .skip(perPage * page)
    .then((response) => {
      return callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
  //ex totalRecord = 20, pageSize = 10, page 1
}

async function getCategoryById(params, callback) {
  const categoryId = params.categoryId;
  Category.findById(categoryId)
    .then((response) => {
      if (!response) callback("Not found category with id: " + categoryId);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}
async function updateCategory(params, callback) {
  const categoryId = params.categoryId;
  Category.findByIdAndUpdate(categoryId, params, { useFindAndModify: false })
    .then((response) => {
      if (!response) callback("Not found category with id: " + categoryId);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}
async function deleteCategory(params, callback) {
  const categoryId = params.categoryId;
  Category.findByIdAndDelete(categoryId)
    .then((response) => {
      if (!response) callback("Not found category with id: " + categoryId);
      else callback(null, response);
    })
    .catch((error) => {
      return callback(error);
    });
}
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
