import { Router } from 'express';
import { 
    createProduct, 
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts,
    getProductsByIds,
    bulkUpdateProducts,
    getAdminProducts
} from '../controllers/product.controller.js';
import { getProductReviews } from '../controllers/review.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import multer from 'multer';
import { upload } from '../config/multer.js'; // YENİ İMPORT YOLU

const router = Router();

// Routes for getting all products and creating a new one
router.route('/')
    .get(getAllProducts)
    .post(
        protect,
        restrictTo('admin'),
        upload.array('images', 5), // 'images' alanı, en fazla 5 dosya
        createProduct
    );

router.post('/by-ids', getProductsByIds);
router.patch('/bulk-update', protect, restrictTo('admin'), bulkUpdateProducts);
router.get('/admin', protect, restrictTo('admin'), getAdminProducts);

// Specific product routes MUST come BEFORE the generic :id route
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);

// Routes for a specific product by ID
router.route('/:id')
    .get(getProduct) // Anyone can get a single product
    .patch(protect, restrictTo('admin'), updateProduct) // Admins can update
    .delete(protect, restrictTo('admin'), deleteProduct); // Admins can delete

export default router;