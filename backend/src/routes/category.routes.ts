import { Router } from 'express';
import { 
    getAllCategories,
    getAdminCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';
import { protect, restrictTo } from '../controllers/auth.controller.js';

const router = Router();

// --- PUBLIC ROUTE ---
router.get('/', getAllCategories);

// --- ADMIN ROUTES ---
router.get('/admin', protect, restrictTo('admin'), getAdminCategories);
router.post('/', protect, restrictTo('admin'), createCategory);

router.route('/:id')
    .get(protect, restrictTo('admin'), getCategory)
    .patch(protect, restrictTo('admin'), updateCategory)
    .delete(protect, restrictTo('admin'), deleteCategory);

export default router;
