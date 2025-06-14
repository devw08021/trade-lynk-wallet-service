import mongoose, { Schema, Document } from 'mongoose';

export interface CryptoWithdrawDocument extends Document {
  userCode: number;
  coinId: mongoose.Types.ObjectId;
  symbol: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  fee: number;
  finalAmount: number;
  status: number, // 0 'pending' | verification | 'completed' | 'rejected';
  comment: string,
  type: string,   // user,admin, gateways
}

const CryptoWithdrawSchema = new Schema<CryptoWithdrawDocument>({
  userCode: { type: Number, required: true },
  coinId: { type: Schema.Types.ObjectId, required: true },
  symbol: { type: String, default: "" },
  userId: { type: Schema.Types.ObjectId, required: true },
  amount: { type: Number, default: 0 },
  fee: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  comment: { type: String, default: "" },
  type: { type: String, default: "user" },
}, {
  timestamps: true
});



export const CryptWithdrawModel = mongoose.model<CryptoWithdrawDocument>('cryptoWithdraw', CryptoWithdrawSchema); 