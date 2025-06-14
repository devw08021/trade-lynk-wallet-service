import { TransactionModel } from '../models/transaction.model';

import { getRepository } from "@/models/repositoryFactory";
import { InternalTransferModel, CryptWithdrawModel } from "@/models/schemas/index";


// import other services
import { WalletService } from "@/services/index";



//initalize other service
const walletService = new WalletService();


export class TransactionService {

  private internelRep = getRepository(InternalTransferModel);
  private cryptoWithdrawRep = getRepository(CryptWithdrawModel);

  async withdrawRequest(userId: string, userCode: string, type: string, twoFa: number, address: string, amount: number, coin: string, coinId: string) {
    try {

      const debit = await walletService.debitAmount(userCode, "funding", coinId, amount);
      console.log("🚀 ~ TransactionService ~ internalTransfer ~ debit:", debit, userCode, coinId, amount)

      if (!debit?.success) return debit

      await this.cryptoWithdrawRep.create({
        userId,
        userCode,
        address,
        amount,
        symbol: coin,
        coinId,
      })

      return { success: true, message: "SUCCESS", code: 200, data: "WITHDRAWAL_REQUEST_CREATED" }
    } catch (error) {
      console.log("🚀 ~ TransactionService ~ withdrawRequest ~ error:", error)
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

  async internalTransfer(userId: string, userCode: string, fromWallet: string, toWallet: string, amount: number, coinId: string, coin: string) {
    try {

      // check balance
      const debit = await walletService.debitAmount(userCode, fromWallet, coinId, amount);
      if (!debit?.success) return debit

      const credit = await walletService.creditAmount(userCode, toWallet, coinId, amount);
      if (!credit?.success) return debit

      await this.internelRep.create({
        symbol: coin,
        fromWallet,
        userCode,
        toWallet,
        amount,
        coinId,
        coin,
        userId,
      })

      return { success: true, message: "SUCCESS", code: 200, data: "SUCCESS" }
    } catch (error) {
      console.log("🚀 ~ TransactionService ~ withdrawRequest ~ error:", error)
      return { success: false, message: "INTERNAL_SERVER_ERROR", code: 500, data: "" }
    }
  }

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
  }

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
  }

  async updateStatus(txId: string, status: string, adminStatus?: string, adminReason?: string) {
    const tx = await TransactionModel.findById(txId);
    if (!tx) throw new Error('Transaction not found');
    tx.status = status;
    if (adminStatus) tx.adminStatus = adminStatus;
    if (adminReason) tx.adminReason = adminReason;
    await tx.save();
    return tx;
  }
}; 