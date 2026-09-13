import { Router } from 'express';
import { createOrder, getOrderById, updateOrderStatus, cancelOrder } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/:id', getOrderById);
router.put('/:id/status', authenticate, updateOrderStatus);
router.post('/:id/cancel', authenticate, cancelOrder);

export default router;
