import mongoose, { Schema, Document, ObjectId } from 'mongoose';

interface EvmAddress {
  address: string;
  privateKey: string;
  currencies: {
    currencyId: ObjectId;
    symbol: string;
  }[];
}

interface NonEvmAddress {
  currencyId: ObjectId;
  symbol: string;
  address: string;
  privateKey: string;
  tag?: string;
}

export interface AddressDocument extends Document {
  userCode: number;
  evm: EvmAddress;
  nonEvm: NonEvmAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<AddressDocument>({
  userCode: { type: Number, required: true, unique: true },
  evm: {
    address: { type: String, required: true },
    privateKey: { type: String, required: true },
    currencies: [{
      currencyId: { type: Schema.Types.ObjectId, required: true },
      symbol: { type: String, required: true }
    }]
  },
  nonEvm: [{
    currencyId: { type: Schema.Types.ObjectId, required: true },
    symbol: { type: String, required: true },
    address: { type: String, required: true },
    privateKey: { type: String, required: true },
    tag: { type: String }
  }]
}, {
  timestamps: true
});

// // Create indexes for efficient querying
// AddressSchema.index({ 'evm.address': 1 });
// AddressSchema.index({ 'nonEvm.address': 1 });
// AddressSchema.index({ 'evm.currencies.currencyId': 1 });
// AddressSchema.index({ 'nonEvm.currencyId': 1 });
// AddressSchema.index({ 'evm.currencies.symbol': 1 });
// AddressSchema.index({ 'nonEvm.symbol': 1 });

export const AddressModel = mongoose.model<AddressDocument>('Address', AddressSchema);