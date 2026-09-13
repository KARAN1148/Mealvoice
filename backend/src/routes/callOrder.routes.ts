import { Router } from 'express';
import {
  lookupCustomerByPhone,
  createPhoneCustomer,
  createCallOrder,
  getCallOrders
} from '../controllers/callOrder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/customer-lookup', authenticate, lookupCustomerByPhone);
router.post('/customer', authenticate, createPhoneCustomer);
router.post('/', authenticate, createCallOrder);
router.get('/', authenticate, getCallOrders);

export default router;
