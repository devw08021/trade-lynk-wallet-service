import { Hono } from 'hono';
import { WalletController, CurrencyController } from '../controllers/index';
import { authMiddleware } from '../middleware/auth.middleware';

const walletRoutes = new Hono();
const waltCtrl = new WalletController();
const currCtrl = new CurrencyController();

// Get all wallets for a user
walletRoutes.get('/getWallets', authMiddleware, waltCtrl.getWallets)


// currency
walletRoutes.get('/getCurrency', authMiddleware, currCtrl.getActiveCurrency)

// withdraw
walletRoutes.post('/withdraw', authMiddleware, waltCtrl.withdrawRequest)
walletRoutes.post('/transfer', authMiddleware, waltCtrl.transfer)


walletRoutes.post('/getDepositAddress', authMiddleware, waltCtrl.getDepositAddress)
// Get a specific wallet
walletRoutes.get('/getWallets/:currency', (c) => waltCtrl.getWallet(c))

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

walletRoutes.get('/eth-service-initialization', (c) => waltCtrl.ethServiceInitialization(c));

export default walletRoutes;