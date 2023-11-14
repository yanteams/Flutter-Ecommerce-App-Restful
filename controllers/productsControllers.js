const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
module.exports = {
    getFavorites: async (req, res) => {
        try {
            const userId = req.user.id;

            const favorites = await Product.find({ favoriteBy: userId });

            res.status(200).json(favorites);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    toggleFavorite: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const userId = req.user.id;

            // Kiểm tra xem người dùng đã favorite sản phẩm chưa
            const isFavorite = product.favoriteBy.includes(userId);

            if (isFavorite) {
                // Nếu người dùng đã favorite, xóa người dùng khỏi mảng favoriteBy
                product.favoriteBy.pull(userId);
            } else {
                // Nếu người dùng chưa favorite, thêm người dùng vào mảng favoriteBy
                product.favoriteBy.push(userId);
            }

            await product.save();
            res.status(200).json(product);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    createProduct: async (req, res) => {
        const products = req.body;

        try {
            const createdProducts = await Promise.all(
                products.map(async (product) => {
                    const { name, description, category, details } = product;

                    const existingProduct = await Product.findOne({ name }).populate('category');
                    if (existingProduct && existingProduct.category.name === category) {
                        console.log(`Product "${name}" already exists with the same category`);
                        return null; // Bỏ qua việc tạo sản phẩm mới và trả về null
                    }

                    const categoryDocument = await Category.findOne({ name: category });
                    if (!categoryDocument) {
                        throw new Error(`Category "${category}" not found`);
                    }

                    const newProduct = await Product.create({
                        name,
                        description,
                        category: categoryDocument._id,
                        details,
                    });
                    return newProduct;
                })
            );

            // Lọc bỏ các sản phẩm null trong mảng createdProducts
            const filteredProducts = createdProducts.filter(product => product !== null);

            res.status(200).json({ message: 'Products created', products: filteredProducts });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create products', error: error.message });
        }
    },
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find().sort({ createAt: -1 })
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json("failed to get the product");

        }
    },
    getProduct: async (req, res) => {
        const productId = req.params.id
        try {
            const product = await Product.findById(productId)
            const { __v, createAt, ...productData } = product._doc;
            res.status(200).json(productData);
        } catch (error) {
            res.status(500).json("failed to get the product");

        }
    },
    searchProducts: async (req, res) => {
        try {
            const results = await Product.aggregate(
                [
                    {
                        $search: {
                            index: "shoes",
                            text: {
                                query: req.params.key,
                                path: {
                                    wildcard: "*"
                                }
                            }
                        }
                    }
                ]
            )
            res.status(200).json(results);
        } catch (error) {
            res.status(500).json("failed to search product");

        }
    }
}