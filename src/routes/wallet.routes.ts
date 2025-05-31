import { Hono } from 'hono';
import { WalletController } from '../controllers/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const walletRoutes = new Hono();

walletRoutes.use('*', authMiddleware);

// Create a new wallet
walletRoutes.post('/', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.createWallet(c);
});

// Get a specific wallet
walletRoutes.get('/:currency', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.getWallet(c);
});

// Get all wallets for a user
walletRoutes.get('/', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.getWallets(c);
});

// Send a transaction
walletRoutes.post('/:walletId/transactions', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.sendTransaction(c);
});

// Get transaction history
walletRoutes.get('/:walletId/transactions', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.getTransactionHistory(c);
});

// Get a specific transaction
walletRoutes.get('/transactions/:txHash', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.getTransaction(c);
});

// Webhook endpoint for blockchain notifications
walletRoutes.post('/webhooks/:currency', (c) => {
  const controller = c.get('walletController') as WalletController;
  return controller.processWebhook(c);
});

walletRoutes.post('/create-address', (c) => {
  const controller = c.get('walletController');
  return controller.createAddress(c);
});

walletRoutes.post('/withdraw', (c) => {
  const controller = c.get('walletController');
  return controller.withdrawRequest(c);
}); 