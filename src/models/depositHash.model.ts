import mongoose, { Schema, Document } from 'mongoose';

export interface DepositHashDocument extends Document {
  userId: string;
  currency: string;
  txHash: string;
  amount: number;
  confirmed: boolean;
  createdAt: Date;
}

const DepositHashSchema = new Schema<DepositHashDocument>({
  userId: { type: String, required: true, index: true },
  currency: { type: String, required: true },
  txHash: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  confirmed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const DepositHashModel = mongoose.model<DepositHashDocument>('DepositHash', DepositHashSchema); 