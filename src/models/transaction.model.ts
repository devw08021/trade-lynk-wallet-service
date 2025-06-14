import mongoose, { Schema, Document } from 'mongoose';

export interface TransactionDocument extends Document {
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  txHash?: string;
  blockNumber?: number;
  timestamp: Date;
  adminStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminReason?: string;
  metadata?: Record<string, any>;
}

const TransactionSchema = new Schema<TransactionDocument>({
  walletId: { type: String, required: true },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED'], required: true },
  txHash: { type: String , default:""},
  blockNumber: { type: Number },
  timestamp: { type: Date, default: Date.now },
  adminStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  adminReason: { type: String },
  metadata: { type: Schema.Types.Mixed },
});

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', TransactionSchema); 