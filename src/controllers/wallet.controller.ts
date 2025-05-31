import { Context } from 'hono';
import { WalletService } from '../services/wallet.service';
import { z } from 'zod';
import { transactionService } from '../services/transaction.service';
import { CurrencyModel } from '../models/currency.model';

const createWalletSchema = z.object({
  currency: z.enum(['BTC', 'ETH', 'TRX', 'BNB']),
});

const sendTransactionSchema = z.object({
  toAddress: z.string(),
  amount: z.number().positive(),
});

export class WalletController {
  constructor(private walletService: WalletService) {}

  async createWallet(c: Context) {
    try {
      const userId = c.get('userId');
      const { currency } = createWalletSchema.parse(await c.req.json());
      
      const wallet = await this.walletService.createWallet(userId, currency);
      return c.json(wallet, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Invalid request data' }, 400);
      }
      return c.json({ error: 'Failed to create wallet' }, 500);
    }
  }

  async getWallet(c: Context) {
    try {
      const userId = c.get('userId');
      const currency = c.req.param('currency') as 'BTC' | 'ETH' | 'TRX' | 'BNB';
      
      const wallet = await this.walletService.getWallet(userId, currency);
      if (!wallet) {
        return c.json({ error: 'Wallet not found' }, 404);
      }
      
      return c.json(wallet);
    } catch (error) {
      return c.json({ error: 'Failed to get wallet' }, 500);
    }
  }

  async getWallets(c: Context) {
    try {
      const userId = c.get('userId');
      const wallets = await this.walletService.getWallets(userId);
      return c.json(wallets);
    } catch (error) {
      return c.json({ error: 'Failed to get wallets' }, 500);
    }
  }

  async sendTransaction(c: Context) {
    try {
      const userId = c.get('userId');
      const walletId = c.req.param('walletId');
      const { toAddress, amount } = sendTransactionSchema.parse(await c.req.json());
      
      const transaction = await this.walletService.sendTransaction(walletId, toAddress, amount);
      return c.json(transaction, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Invalid request data' }, 400);
      }
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to send transaction' }, 500);
    }
  }

  async getTransaction(c: Context) {
    try {
      const txHash = c.req.param('txHash');
      const transaction = await this.walletService.getTransaction(txHash);
      
      if (!transaction) {
        return c.json({ error: 'Transaction not found' }, 404);
      }
      
      return c.json(transaction);
    } catch (error) {
      return c.json({ error: 'Failed to get transaction' }, 500);
    }
  }

  async getTransactionHistory(c: Context) {
    try {
      const userId = c.get('userId');
      const walletId = c.req.param('walletId');
      
      const transactions = await this.walletService.getTransactionHistory(walletId);
      return c.json(transactions);
    } catch (error) {
      return c.json({ error: 'Failed to get transaction history' }, 500);
    }
  }

  async processWebhook(c: Context) {
    try {
      const currency = c.req.param('currency') as 'BTC' | 'ETH' | 'TRX' | 'BNB';
      const { txHash } = await c.req.json();
      
      await this.walletService.processWebhook(currency, txHash);
      return c.json({ status: 'success' });
    } catch (error) {
      return c.json({ error: 'Failed to process webhook' }, 500);
    }
  }

  async createAddress(c: Context) {
    const userId = c.get('userId');
    // Create both EVM and NON_EVM wallets if not exist
    const wallets = await this.walletService.getOrCreateWallets(userId);
    return c.json(wallets);
  }

  async withdrawRequest(c: Context) {
    const userId = c.get('userId');
    const { currency, amount } = await c.req.json();
    // 1. Check currency exists and is active
    const currencyObj = await CurrencyModel.findOne({ symbol: currency });
    if (!currencyObj || !currencyObj.isActive) return c.json({ error: 'Currency not supported' }, 400);
    // 2. Check user balance
    const type = currencyObj.isEvm ? 'EVM' : 'NON_EVM';
    const wallet = await this.walletService.getWalletByType(userId, type);
    if (!wallet || !wallet.balances[currency] || wallet.balances[currency].spot < amount + currencyObj.withdrawalFee)
      return c.json({ error: 'Insufficient balance' }, 400);
    // 3. Register withdrawal request (PENDING)
    const tx = await transactionService.createWithdrawalRequest(wallet.walletId, amount, currencyObj.withdrawalFee);
    return c.json({ status: 'pending', tx });
  }
} 