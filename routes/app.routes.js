const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller');


router.post("/category", categoryController.create);
router.get("/category", categoryController.findAll);
router.get("/category/:id", categoryController.findOne);
router.put("/category/:id", categoryController.update);
router.delete("/category/:id", categoryController.delete);

module.exports = router;