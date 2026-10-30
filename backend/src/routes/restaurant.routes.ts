import { Router } from 'express';
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantOrders,
  updateRestaurantOrderStatus
} from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getRestaurants);                                     // GET /api/restaurants?search=&cuisine=&page=&limit=&sortBy=
router.get('/orders', authenticate, getRestaurantOrders);           // GET /api/restaurants/orders
router.get('/:id', getRestaurantById);                              // GET /api/restaurants/:id
router.get('/:id/menu', getRestaurantMenu);                         // GET /api/restaurants/:id/menu
router.put('/orders/:id/status', authenticate, updateRestaurantOrderStatus); // PUT /api/restaurants/orders/:id/status

export default router;
