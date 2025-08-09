import { Router } from 'express';
import { 
    createProduct, 
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller.js';
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

// Routes for a specific product by ID
router.route('/:id')
    .get(getProduct) // Anyone can get a single product
    .patch(protect, restrictTo('admin'), updateProduct) // Admins can update
    .delete(protect, restrictTo('admin'), deleteProduct); // Admins can delete

export default router;