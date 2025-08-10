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
import { upload } from '../config/multer.js'; // multer'ı import et

const router = Router();

// --- PUBLIC ROUTE ---
router.get('/', getAllCategories);

// --- ADMIN ROUTES ---
router.use(protect, restrictTo('admin'));

router.get('/admin', getAdminCategories);
// Kategori oluşturmaya görsel yüklemeyi ekle (tek dosya: 'image')
router.post('/', upload.single('image'), createCategory);

router.route('/:id')
    .get(getCategory)
    // Kategori güncellemeye görsel yüklemeyi ekle
    .patch(upload.single('image'), updateCategory)
    .delete(deleteCategory);

export default router;