import { Router } from 'express';
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantOrders,
  updateRestaurantOrderStatus
} from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getRestaurants);
router.get('/orders', authenticate, getRestaurantOrders);
router.get('/:id', getRestaurantById);
router.put('/orders/:id/status', authenticate, updateRestaurantOrderStatus);

export default router;
