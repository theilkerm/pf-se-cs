import { Router } from 'express';
import { createProduct, getAllProducts } from '../controllers/product.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import multer from 'multer';

// For simplicity, we'll use memory storage. In a real app, you might use diskStorage.
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.route('/')
    .get(getAllProducts)
    .post(
        protect,
        restrictTo('admin'),
        upload.array('images', 5), // 'images' is the field name, max 5 files
        createProduct
    );

export default router;