import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import {
    getMe,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    updateMyPassword
} from '../controllers/user.controller.js';

const router = Router();

// --- Routes for the logged-in user ---
router.use(protect); // All routes below this point are protected
router.get('/me', getMe);
router.patch('/update-me', updateMe);
router.patch('/update-my-password', updateMyPassword);

// --- Routes for Admin only ---
router.use(restrictTo('admin')); // All routes below this point are for admins only

router.route('/')
    .get(getAllUsers);
    
router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;