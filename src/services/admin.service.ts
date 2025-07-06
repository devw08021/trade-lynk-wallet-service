import { TransactionService } from './index';
import { coinService } from './coin.service';

export const adminService = {
  async approveWithdrawal(txId: string, userId: string, symbol: string, amount: number, address: string) {
    // Call coinService to process withdrawal
    const txHash = await coinService.withdraw(userId, symbol, amount, address);
    // Update transaction status
    return await TransactionService.updateStatus(txId, 'COMPLETED', 'APPROVED');
  },

  async rejectWithdrawal(txId: string, reason: string) {
    // Update transaction status to rejected
    return await TransactionService.updateStatus(txId, 'REJECTED', 'REJECTED', reason);
  },
}; 