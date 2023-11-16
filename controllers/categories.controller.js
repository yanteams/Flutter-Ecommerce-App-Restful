const categoriesService = require("../services/categories.service");
  exports.create = (req, res, next) => {
    var model = {
      categoryName: req.body.name,
    };

    categoriesService.getCategoryByName(model.categoryName, (error, category) => {
      if (error) {
        return next(error);
      } else if (category) {
        return res.status(400).send({
          message: "Category name already exists",
        });
      } else {
        categoriesService.createCategory(model, (error, results) => {
          if (error) {
            return next(error);
          } else {
            return res.status(200).send({
              message: "Success",
              data: results,
            });
          }
        });
      }
    });
  };
exports.findAll = (req, res, next) => {
  var model = {
    categoryName: req.query.name,
    pageSize: req.query.pageSize,
    page: req.query.page,
  };
  categoriesService.getCategories(model, (error, results) => {
    if (error) {
      return next(error);
    } else {
      return res.status(200).send({
        nessage: "Success",
        data: results,
      });
    }
  });
};

exports.findOne = (req, res, next) => {
  var model = {
    categoryId: req.params.id,
  };
  categoriesService.getCategoryById(model, (error, results) => {
    if (error) {
      return next(error);
    } else {
      return res.status(200).send({
        nessage: "Success",
        data: results,
      });
    }
  });
};
exports.update = (req, res, next) => {
  var model = {
    categoryId: req.params.id,
    categoryName: req.body.name,
  };
  categoriesService.updateCategory(model, (error, results) => {
    if (error) {
      return next(error);
    } else {
      return res.status(200).send({
        message: "Success",
        data: results,
      });
    }
  });
};


exports.delete = (req, res, next) => {
  var model = {
    categoryId: req.params.id,
  };
  categoriesService.deleteCategory(model, (error, results) => {
    if (error) {
      return next(error);
    } else {
      return res.status(200).send({
        nessage: "Success",
        data: results,
      });
    }
  });
};