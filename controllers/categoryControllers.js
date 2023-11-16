const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "Success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: 'Internal server error' });
  }
};
exports.createCategory = async (req, res) => {
  const categories = req.body;

  try {
    for (let i = 0; i < categories.length; i++) {
      const existingCategory = await Category.findOne({ name: categories[i].name });
      if (existingCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }

      await Category.create({ name: categories[i].name, description: categories[i].description });
    }
    res.status(200).json({ message: 'Categories created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findOneAndDelete(id);
    if (deletedCategory) {
      res.status(200).json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);

    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const updatedCategory = req.body;

  try {
    const category = await Category.findByIdAndUpdate(id, updatedCategory, { new: true });

    if (category) {
      res.status(200).json({ message: 'Category updated successfully', category });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};