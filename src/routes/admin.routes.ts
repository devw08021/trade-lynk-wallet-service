import { Hono } from 'hono';
import { AdminController,CurrencyController, WalletController } from '../controllers/index';
import { adminMiddleware } from '../middleware/auth.middleware';

export const adminRoutes = new Hono();

// adminRoutes.use('*', adminMiddleware);

const adminCtl = new AdminController();
const currencyCtl = new CurrencyController();
const walletCtl = new WalletController();



// get all coin list
adminRoutes.get('/coins', (c) => currencyCtl.getAllCurrency(c));
adminRoutes.get('/coin/:id', (c) => currencyCtl.getCurrencyById(c));
adminRoutes.post('/coin', (c) => currencyCtl.addCurrency(c));
adminRoutes.put('/coin/:id', (c) => currencyCtl.updateCurrency(c));


adminRoutes.post('/withdraw/accept', (c) => adminCtl.withdrawAccept(c)); 