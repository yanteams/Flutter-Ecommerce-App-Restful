const router = require('express').Router();
const productController = require('../controllers/productsControllers');
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProduct)
router.get('/search/:key', productController.searchProducts)
router.post('/', productController.createProduct)
router.get('/favorites', productController.getFavorites);
router.put('/favorites/:id', productController.toggleFavorite);
module.exports = router;