import mongoose, { Schema, Document } from 'mongoose';

export interface CurrencyDocument extends Document {
  symbol: string;
  name: string;
  isEvm: boolean;
  withdrawalFee: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  dailyLimit: number;
  image: string;
  isActive: boolean;
}

const CurrencySchema = new Schema<CurrencyDocument>({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isEvm: { type: Boolean, required: true },
  withdrawalFee: { type: Number, required: true },
  minDeposit: { type: Number, required: true },
  maxDeposit: { type: Number, required: true },
  minWithdraw: { type: Number, required: true },
  dailyLimit: { type: Number, required: true },
  image: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

export const CurrencyModel = mongoose.model<CurrencyDocument>('Currency', CurrencySchema); 