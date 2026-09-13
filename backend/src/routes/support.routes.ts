import { Router } from 'express';
import { createSupportTicket, getSMSLogs } from '../controllers/support.controller';

const router = Router();

router.post('/ticket', createSupportTicket);
router.get('/sms-logs', getSMSLogs);

export default router;
