import { Router } from 'express';
import { subscribeToNewsletter, getAllSubscribers } from '../controllers/newsletter.controller.js';

const router = Router();

router.post('/', subscribeToNewsletter);
router.get('/', getAllSubscribers);

export default router;