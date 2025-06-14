import mongoose, { Schema, Document } from 'mongoose';

export interface InternalTransferDocument extends Document {
  userCode: number;
  coinId: mongoose.Types.ObjectId;
  symbol: string;
  userId: mongoose.Types.ObjectId;
  fromWallet: 'funding' | 'spot' | 'p2p' | 'perpetual';
  toWallet: 'funding' | 'spot' | 'p2p' | 'perpetual';
}

const InternalTransferSchema = new Schema<InternalTransferDocument>({
  userCode: { type: Number, required: true },
  coinId: { type: Schema.Types.ObjectId, required: true },
  symbol: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  fromWallet: { type: String, required: true },
  toWallet: { type: String, required: true }
}, {
  timestamps: true
});



export const InternalTransferModel = mongoose.model<InternalTransferDocument>('internalTransfer', InternalTransferSchema); 