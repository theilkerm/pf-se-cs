import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, verifyEmail } from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.status(204).end();
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.patch('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);


export default router;