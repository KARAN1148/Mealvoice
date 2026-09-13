import { Router } from 'express';
import { getCustomerProfile, addCustomerAddress } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, getCustomerProfile);
router.post('/address', authenticate, addCustomerAddress);

export default router;
