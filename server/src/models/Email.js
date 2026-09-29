import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true }, body: { type: String, required: true }, sender: { type: String, required: true, trim: true, lowercase: true }, customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' }, intent: { type: String, enum: ['general_inquiry', 'schedule_meeting', 'invoice_request', 'support_request', 'sales_opportunity'], default: 'general_inquiry' }, urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' }, confidence: { type: Number, min: 0, max: 1, default: 0 }, autoResponse: String, recommendations: [{ type: String }], processed: { type: Boolean, default: false }
}, { timestamps: true });
export const Email = mongoose.model('Email', emailSchema);
