import { Router } from 'express';
import { protect } from '../controllers/auth.controller.js';
import { getMe } from '../controllers/user.controller.js';

const router = Router();

// This middleware runs FOR ALL routes defined AFTER it in this file.
// This means any route like /me, /updateProfile etc. will require the user to be logged in.
router.use(protect);

router.get('/me', getMe);

export default router;