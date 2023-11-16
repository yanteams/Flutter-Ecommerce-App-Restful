const router = require('express').Router();
const productController = require('../controllers/productsControllers');
router.get('/all', productController.getAllProducts)
// router.get('/:id', productController.getProduct)
router.get('/', productController.getProductsByCategoryId)
router.get('/search/:key', productController.searchProducts)
router.post('/', productController.createProduct)
router.get('/get-favorites/', productController.getFavorites);
router.put('/favorites', productController.toggleFavorite);
router.delete('/', productController.deleteAllProducts);
module.exports = router;