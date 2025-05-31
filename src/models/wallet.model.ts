import mongoose, { Schema, Document } from 'mongoose';

export type WalletType = 'EVM' | 'NON_EVM';

export interface WalletBalance {
  spot: number;
  p2p: number;
  perpetual: number;
}

export interface WalletDocument extends Document {
  walletId: string; // userId
  type: WalletType;
  address?: string; // EVM only
  addresses?: Record<string, string>; // NON_EVM only
  balances: Record<string, WalletBalance>; // coin symbol -> balances
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>({
  walletId: { type: String, required: true, index: true },
  type: { type: String, enum: ['EVM', 'NON_EVM'], required: true },
  address: { type: String }, // EVM only
  addresses: { type: Map, of: String }, // NON_EVM only
  balances: {
    type: Map,
    of: new Schema({
      spot: { type: Number, default: 0 },
      p2p: { type: Number, default: 0 },
      perpetual: { type: Number, default: 0 },
    }, { _id: false }),
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WalletSchema.index({ walletId: 1, type: 1 }, { unique: true });

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema); 