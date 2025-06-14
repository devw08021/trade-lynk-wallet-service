import mongoose, { Schema, Document } from 'mongoose';

export interface CurrencyDocument extends Document {
  symbol: string;
  name: string;
  network: string;  // eth, bnb, btc
  contractAddress: string;
    // network: {
    // chainId: string;
    // chainName: string;
    // decimals: number;
    // rpcUrls: string[];
    // symbol: string;
    // tag: string;
    // isActive: boolean;
  // }
  type: string;
  tokenType: string;
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
  network: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contractAddress: { type: String, required: true },
  type: { type: String, required: true },
  tokenType: { type: String, required: true },
  isEvm: { type: Boolean, required: true },
  withdrawalFee: { type: Number, required: true },
  minDeposit: { type: Number, required: true },
  maxDeposit: { type: Number, required: true },
  minWithdraw: { type: Number, required: true },
  dailyLimit: { type: Number, required: true },
  image: { type: String, required: true },
  isActive: { type: Boolean, default: true },
// network: [{
    // chainId: { type: String, required: true },
    // chainName: { type: String, required: true },
    // decimals: { type: Number, required: true },
    // rpcUrls: { type: [String], required: true },
    // symbol: { type: String, required: true },
    // tag: { type: String },
  // }]
});

export const CurrencyModel = mongoose.model<CurrencyDocument>('Currency', CurrencySchema); 