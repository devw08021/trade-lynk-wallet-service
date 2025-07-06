import mongoose, { Schema, Document } from 'mongoose';

export interface CurrencyDocument extends Document {
  symbol: string;
  name: string;
  isActive: boolean;
  network: {
    chainId: string;
    chainName: string;
    decimals: number;
    rpcUrls: string[];
    tag: string;
    isActive: boolean;
    contractAddress: string;
    isEvm: boolean;
    withdrawalFee: number;
    minDeposit: number;
    maxDeposit: number;
    minWithdraw: number;
    dailyLimit: number;
  },
  type: string;
  image: string;
}

const CurrencySchema = new Schema<CurrencyDocument>({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'coin' or 'token'
  image: { type: String, default: "" },
  isActive: { type: Boolean, required: true },
  network: [{
    chainId: { type: String, required: true },
    chainName: { type: String, required: true },
    decimals: { type: Number, required: true },
    rpcUrls: { type: [String], required: true },
    tag: { type: String },
    isActive: { type: Boolean, required: true },
    contractAddress: { type: String, default: '' },
    withdrawalFee: { type: Number, required: true },
    minDeposit: { type: Number, required: true },
    maxDeposit: { type: Number, required: true },
    minWithdraw: { type: Number, required: true },
    dailyLimit: { type: Number, required: true },
    isEvm: { type: Boolean, required: true },
  }]
}, {
  timestamps: true
});

export const CurrencyModel = mongoose.model<CurrencyDocument>('Currency', CurrencySchema); 