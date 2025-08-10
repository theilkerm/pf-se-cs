import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller.js';
import {
    getMe,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    updateMyPassword,
    addAddress,
    updateAddress,
    deleteAddress
} from '../controllers/user.controller.js';
import validate from '../middleware/validate.js';
import { addressSchema } from '../schemas/user.schema.js';

const router = Router();

// --- Routes for the logged-in user ---
router.use(protect);
router.get('/me', getMe);
router.patch('/update-me', updateMe);
router.patch('/update-my-password', updateMyPassword);

// Address Management
router.route('/me/addresses')
    .post(validate(addressSchema), addAddress);

router.route('/me/addresses/:addressId')
    .patch(validate(addressSchema), updateAddress)
    .delete(deleteAddress);

// --- Routes for Admin only ---
router.use(restrictTo('admin'));
router.route('/')
    .get(getAllUsers);
    
router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;