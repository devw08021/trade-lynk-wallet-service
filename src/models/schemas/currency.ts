import mongoose, { Schema, Document } from 'mongoose';

export interface CurrencyDocument extends Document {
  symbol: string;
  name: string;
  network: {
    chainId: string;
    chainName: string;
    decimals: number;
    rpcUrls: string[];
    symbol: string;
    address: string;
    privateKey: string;
    tag: string;
    isActive: boolean;
  }
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
  network: [{
    chainId: { type: String, required: true },
    chainName: { type: String, required: true },
    decimals: { type: Number, required: true },
    rpcUrls: { type: [String], required: true },
    symbol: { type: String, required: true },
    address: { type: String, required: true },  // admin address
    privateKey: { type: String, required: true }, // admin private key
    tag: { type: String },
  }]
});

export const CurrencyModel = mongoose.model<CurrencyDocument>('Currency', CurrencySchema); 