import { Hono } from 'hono';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/auth.middleware';

export const adminRoutes = new Hono();

adminRoutes.use('*', adminAuthMiddleware);

const adminController = new AdminController();

adminRoutes.post('/withdraw/accept', (c) => adminController.withdrawAccept(c)); 