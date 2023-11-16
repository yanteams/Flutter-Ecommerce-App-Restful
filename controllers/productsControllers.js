const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const perPage = 10;
module.exports = {
    getFavorites: async (req, res) => {
        try {
            const userId = req.query.userId;
            const perPage = 10;
            const page = parseInt(req.query.page) || 1;

            const totalCount = await Product.estimatedDocumentCount({ favoriteBy: userId });
            const maxPage = Math.ceil(totalCount / perPage);

            if (page < 1 || page > maxPage) {
                return res.status(400).json({ message: 'Invalid page number' });
            }

            const skip = (page - 1) * perPage;
            const favorites = await Product.find({ favoriteBy: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPage);

            res.status(200).json({ message: 'Get favorite products by userId success', favorites, currentPage: page, totalPages: maxPage });
        } catch (error) {
            res.status(500).json({ message: 'Failed to get the favorite products' });
        }
    },
    toggleFavorite: async (req, res) => {
        try {
            const productId = req.query.productId;
            const userId = req.query.userId;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            console.log(userId);
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
            res.status(200).json({ message: "Put favorite userId success", product });
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

            res.status(200).json({ message: 'Products created', data: filteredProducts });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create products', error: error.message });
        }
    },
    deleteAllProducts: async (req, res) => {
        try {
            await Product.deleteMany({});
            res.status(200).json({ message: 'All products deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete products', error: error.message });
        }
    },
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find().sort({ createAt: -1 })
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json("failed to get all the product");

        }
    },
    getProductsByCategoryId: async (req, res) => {
        try {
            const categoryId = req.query.categoryId;
            console.log(categoryId);
            const perPage = 10;
            const page = parseInt(req.query.page) || 1;
            console.log(page);
            const totalCount = await Product.estimatedDocumentCount({ category: categoryId });
            const maxPage = Math.ceil(totalCount / perPage);

            if (page < 0 || page > maxPage) {
                return res.status(400).json({ message: 'Invalid page number' });
            }

            let skip = 0;
            let limit = perPage;
            if (page > 0) {
                skip = (page - 1) * perPage;
            } else {
                limit = totalCount;
            }

            const products = await Product.find({ category: categoryId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            res.status(200).json({ message: 'Get product by categoryId success', products, currentPage: page, totalPages: maxPage });
        } catch (error) {
            res.status(500).json({ message: 'Failed to get the products' });
        }
    },
    // getProduct: async (req, res) => {
    //     const productId = req.params.id
    //     try {
    //         const product = await Product.findById(productId)
    //         const { __v, createAt, ...productData } = product._doc;
    //         res.status(200).json(productData);
    //     } catch (error) {
    //         res.status(500).json("failed to get the product");

    //     }
    // },
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