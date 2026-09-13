import { Router } from 'express';
import { getAdminDashboard, getAdminAnalytics, getAdminOrders } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, getAdminDashboard);
router.get('/analytics', authenticate, getAdminAnalytics);
router.get('/orders', authenticate, getAdminOrders);

export default router;
