import { transactionService } from './transaction.service';
import { coinService } from './coin.service';

export const adminService = {
  async approveWithdrawal(txId: string, userId: string, symbol: string, amount: number, address: string) {
    // Call coinService to process withdrawal
    const txHash = await coinService.withdraw(userId, symbol, amount, address);
    // Update transaction status
    return await transactionService.updateStatus(txId, 'COMPLETED', 'APPROVED');
  },

  async rejectWithdrawal(txId: string, reason: string) {
    // Update transaction status to rejected
    return await transactionService.updateStatus(txId, 'REJECTED', 'REJECTED', reason);
  },
}; 