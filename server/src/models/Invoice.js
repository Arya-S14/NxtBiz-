import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({ description: { type: String, required: true }, quantity: { type: Number, min: 1, default: 1 }, unitPrice: { type: Number, min: 0, required: true } }, { _id: false });
const invoiceSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  amount: { type: Number, min: 0, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'void'], default: 'draft' },
  pdfUrl: String,
  lineItems: [lineItemSchema]
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
