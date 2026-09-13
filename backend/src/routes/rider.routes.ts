import { Router } from 'express';
import { getRiderDeliveries, acceptDelivery, updateDeliveryStatus } from '../controllers/rider.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/deliveries', authenticate, getRiderDeliveries);
router.post('/deliveries/:id/accept', authenticate, acceptDelivery);
router.put('/deliveries/:id/status', authenticate, updateDeliveryStatus);

export default router;
