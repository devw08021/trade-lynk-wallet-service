import { TransactionModel } from '../models/transaction.model';
import { Types } from 'mongoose';

export const transactionService = {
  async createDepositTransaction(userId: string, currency: string, amount: number) {
    // Find the user's wallet (EVM or NON_EVM)
    // This is a placeholder; actual logic should determine wallet type
    const walletType = 'EVM';
    const walletId = userId;
    const tx = new TransactionModel({
      walletId,
      type: 'DEPOSIT',
      amount,
      status: 'COMPLETED',
      timestamp: new Date(),
    });
    await tx.save();
    return tx;
  },

  async createWithdrawalRequest(walletId: string, amount: number, withdrawalFee: number) {
    const tx = new TransactionModel({
      walletId,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      timestamp: new Date(),
      metadata: { withdrawalFee },
    });
    await tx.save();
    return tx;
  },

  async updateStatus(txId: string, status: string, adminStatus?: string, adminReason?: string) {
    const tx = await TransactionModel.findById(txId);
    if (!tx) throw new Error('Transaction not found');
    tx.status = status;
    if (adminStatus) tx.adminStatus = adminStatus;
    if (adminReason) tx.adminReason = adminReason;
    await tx.save();
    return tx;
  },
}; 