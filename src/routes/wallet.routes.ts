import { Hono } from 'hono';
import { WalletController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';


// initalize controler
const waltCtrl = new WalletController();

const walletRoutes = new Hono();

// walletRoutes.use('*', authMiddleware);

// create a new wallet
walletRoutes.post('/createWallet', (c) => waltCtrl.createWallet(c))


// Get a specific wallet
walletRoutes.get('/getWallets/:currency', (c) => waltCtrl.getWallet(c))
// Get all wallets for a user

walletRoutes.get('/getWallets', (c) => waltCtrl.getWallets(c))
// Send a transaction
walletRoutes.post('/:walletId/transactions', (c) => waltCtrl.sendTransaction(c))

// Get transaction history
walletRoutes.get('/:walletId/transactions', (c) => waltCtrl.getTransactionHistory(c))

// Get a specific transaction
walletRoutes.get('/transactions/:txHash', (c) => waltCtrl.getTransaction(c))

// Webhook endpoint for blockchain notifications
walletRoutes.post('/webhooks/:currency', (c) => waltCtrl.processWebhook(c))

walletRoutes.post('/create-address', (c) => waltCtrl.createAddress(c))
walletRoutes.post('/withdraw', (c) => waltCtrl.withdrawRequest(c))

export default walletRoutes;