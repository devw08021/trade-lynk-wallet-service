import mongoose, { Schema, Document } from 'mongoose';

export interface PendingDepositDocument extends Document {
  userCode: number;
  currencyId: mongoose.Types.ObjectId;
  symbol: string;
  chainId: string;  // eth, bnb, etc.
  tokenType: string; // native, erc20, bep20
  address: string;
  txHash: string;
  amount: number;
  totalAmount: number; // Accumulated amount including previous deposits
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PendingDepositSchema = new Schema<PendingDepositDocument>({
  userCode: { type: Number, required: true },
  currencyId: { type: Schema.Types.ObjectId, required: true },
  symbol: { type: String, required: true },
  chainId: { type: String, required: true },
  tokenType: { type: String, required: true },
  address: { type: String, required: true },
  txHash: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create indexes
PendingDepositSchema.index({ userCode: 1, currencyId: 1 });
PendingDepositSchema.index({ txHash: 1 }, { unique: true });
PendingDepositSchema.index({ status: 1 });
PendingDepositSchema.index({ chainId: 1, tokenType: 1 });

export const PendingDepositModel = mongoose.model<PendingDepositDocument>('PendingDeposit', PendingDepositSchema); 