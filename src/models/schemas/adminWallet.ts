import mongoose, { Schema, Document } from 'mongoose';

interface ChainWallet {
  address: string;
  privateKey: string;
  chainId: string;
  isActive: boolean;
}

export interface AdminWalletDocument extends Document {
  userCode: number;
  wallets: ChainWallet[];
  createdAt: Date;
  updatedAt: Date;
}

const ChainWalletSchema = new Schema<ChainWallet>({
  address: { type: String, required: true },
  privateKey: { type: String, required: true },
  chainId: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const AdminWalletSchema = new Schema<AdminWalletDocument>({
  userCode: { type: Number, required: true, unique: true },
  wallets: [ChainWalletSchema]
}, {
  timestamps: true
});

// Create indexes
AdminWalletSchema.index({ userCode: 1 }, { unique: true });
AdminWalletSchema.index({ 'wallets.chainId': 1, 'wallets.address': 1 }, { unique: true });
AdminWalletSchema.index({ 'wallets.isActive': 1 });

export const AdminWalletModel = mongoose.model<AdminWalletDocument>('AdminWallet', AdminWalletSchema); 