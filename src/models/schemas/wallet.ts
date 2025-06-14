import mongoose, { Schema, Document, ObjectId } from 'mongoose';

// Common interface for wallet balances
export interface WalletBalance {
  spot: number;
  p2p: number;
  perpetual: number;
  currencyId: ObjectId;
  symbol: string;
}

export interface WalletDocument extends Document {
  userCode: number;
  balances: WalletBalance[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>({
  userCode: { type: Number, required: true, index: true },
  balances: [{
    currencyId: { type: Schema.Types.ObjectId, required: true },
    spot: { type: Number, default: 0 },
    p2p: { type: Number, default: 0 },
    perpetual: { type: Number, default: 0 },
    symbol: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Create indexes
WalletSchema.index({ userCode: 1 }, { unique: true });
WalletSchema.index({ 'balances.currencyId': 1, userCode: 1 }, { unique: true });

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema); 