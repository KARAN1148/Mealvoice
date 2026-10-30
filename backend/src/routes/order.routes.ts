import { Router } from 'express';
import { createOrder, getOrderById, updateOrderStatus, cancelOrder, listMyOrders } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/mine', authenticate, listMyOrders);           // GET  /api/orders/mine?page=1&limit=10
router.post('/', authenticate, createOrder);              // POST /api/orders
router.get('/:id', getOrderById);                         // GET  /api/orders/:id
router.put('/:id/status', authenticate, updateOrderStatus); // PUT  /api/orders/:id/status
router.post('/:id/cancel', authenticate, cancelOrder);    // POST /api/orders/:id/cancel

export default router;
