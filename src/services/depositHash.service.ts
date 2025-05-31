import { DepositHashModel } from '../models/depositHash.model';

export const depositHashService = {
  async addDeposit({ userId, currency, txHash, amount }) {
    const deposit = new DepositHashModel({ userId, currency, txHash, amount });
    await deposit.save();
    return deposit;
  },

  async getTotalDeposits(userId: string, currency: string) {
    const deposits = await DepositHashModel.find({ userId, currency, confirmed: false });
    return deposits.reduce((sum, d) => sum + d.amount, 0);
  },

  async confirmDeposits(userId: string, currency: string) {
    await DepositHashModel.updateMany({ userId, currency, confirmed: false }, { $set: { confirmed: true } });
  },

  async deleteConfirmedOlderThan(days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    await DepositHashModel.deleteMany({ confirmed: true, createdAt: { $lt: cutoff } });
  },
}; 