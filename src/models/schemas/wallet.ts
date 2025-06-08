import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface WalletBalance {
  spot: number;
  p2p: number;
  perpetual: number;
  currencyId: ObjectId;
  network: {
    symbol: string;
    address: string;
    privateKey: string;
    tag: string;
  }
}

export interface WalletDocument extends Document {
  userCode: number; // userId
  assets: Record<string, WalletBalance>; // coin symbol -> balances
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>({
  userCode: { type: Number, required: true, index: true },
  assets: [
    {
      currencyId: { type: Schema.Types.ObjectId, required: true },
      spot: { type: Number, default: 0 },
      p2p: { type: Number, default: 0 },
      perpetual: { type: Number, default: 0 },
      network: {
        symbol: { type: String, required: true },
        address: { type: String, default: "" },
        privateKey: { type: String, default: "" },
        tag: { type: String, default: "" }
      }
    }
  ]
}, {
  timestamps: true
});

WalletSchema.index({ walletId: 1, }, { unique: true });

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema); 