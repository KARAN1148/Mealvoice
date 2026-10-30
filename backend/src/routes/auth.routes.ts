import { Router } from 'express';
import { login, register, getMe, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/login',
  validateBody({ email: { required: true, type: 'email' }, password: { required: true, type: 'string', minLength: 1 } }),
  login
);

router.post(
  '/register',
  validateBody({
    name: { required: true, type: 'string', minLength: 2, maxLength: 80 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 6 },
    phone: { required: true, type: 'phone' }
  }),
  register
);

router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

export default router;
