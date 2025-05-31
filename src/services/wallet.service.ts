import { Collection, MongoClient } from 'mongodb';
import { Wallet, Transaction } from '../models/wallet.model';
import { BlockchainAdapter, BitcoinAdapter, EthereumAdapter, TronAdapter, BnbAdapter } from '../adapters/blockchain.adapter';
import { config } from '../config';
import { WalletModel, WalletType, WalletDocument } from '../models/wallet.model';
import { connectRedis } from '../config/redis';
import { CurrencyModel } from '../models/currency.model';
import { Types } from 'mongoose';
import { depositHashService } from './depositHash.service';
import { transactionService } from './transaction.service';

const EVM_SERVERS = ['ETH', 'BNB', 'POLYGON']; // Example
const NON_EVM_SYMBOLS = ['BTC', 'LTC']; // Example

export const walletService = {
  async createUserWallets(userId: string) {
    let evmAddress = null;
    for (const evmServer of EVM_SERVERS) {
      try {
        evmAddress = `evm_${userId}_${evmServer}`;
        if (evmAddress) break;
      } catch {}
    }
    const evmWallet = new WalletModel({
      walletId: userId,
      type: 'EVM',
      address: evmAddress,
      balances: {},
    });
    const addresses: Record<string, string> = {};
    for (const symbol of NON_EVM_SYMBOLS) {
      try {
        addresses[symbol] = `non_evm_${userId}_${symbol}`;
      } catch {}
    }
    const nonEvmWallet = new WalletModel({
      walletId: userId,
      type: 'NON_EVM',
      addresses,
      balances: {},
    });
    await WalletModel.insertMany([evmWallet, nonEvmWallet]);
    return { evmWallet, nonEvmWallet };
  },

  async getWalletByType(userId: string, type: WalletType): Promise<WalletDocument | null> {
    const redis = await connectRedis();
    const cacheKey = `wallet:${userId}:${type}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const wallet = await WalletModel.findOne({ walletId: userId, type });
    if (wallet) await redis.set(cacheKey, JSON.stringify(wallet), { EX: 60 });
    return wallet;
  },

  async incrementBalance(userId: string, symbol: string, type: WalletType, amount: number, balanceType: 'spot' | 'p2p' | 'perpetual') {
    const wallet = await WalletModel.findOne({ walletId: userId, type });
    if (!wallet) throw new Error('Wallet not found');
    if (!wallet.balances[symbol]) wallet.balances[symbol] = { spot: 0, p2p: 0, perpetual: 0 };
    wallet.balances[symbol][balanceType] += amount;
    await wallet.save();
    const redis = await connectRedis();
    const cacheKey = `wallet:${userId}:${type}`;
    await redis.set(cacheKey, JSON.stringify(wallet), { EX: 60 });
    return wallet;
  },

  async getOrCreateWallets(userId: string) {
    let evmWallet = await WalletModel.findOne({ walletId: userId, type: 'EVM' });
    let nonEvmWallet = await WalletModel.findOne({ walletId: userId, type: 'NON_EVM' });
    if (!evmWallet || !nonEvmWallet) {
      const created = await walletService.createUserWallets(userId);
      evmWallet = created.evmWallet;
      nonEvmWallet = created.nonEvmWallet;
    }
    return { evmWallet, nonEvmWallet };
  },

  async handleDeposit({ userId, currency, amount, txHash }) {
    const currencyObj = await CurrencyModel.findOne({ symbol: currency });
    if (!currencyObj) return;
    await depositHashService.addDeposit({ userId, currency, txHash, amount });
    const total = await depositHashService.getTotalDeposits(userId, currency);
    if (total >= currencyObj.minDeposit) {
      await depositHashService.confirmDeposits(userId, currency);
      await transactionService.createDepositTransaction(userId, currency, total);
      const type = currencyObj.isEvm ? 'EVM' : 'NON_EVM';
      await walletService.incrementBalance(userId, currency, type, total, 'spot');
    }
  },

  async reachMinDeposit(userId: string, currency: string) {
    const currencyObj = await CurrencyModel.findOne({ symbol: currency });
    if (!currencyObj) return false;
    const total = await depositHashService.getTotalDeposits(userId, currency);
    return total >= currencyObj.minDeposit;
  },
}; 