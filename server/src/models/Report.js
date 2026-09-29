import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  recommendations: [{ type: String }],
  summary: { type: String, required: true },
  pdfUrl: String,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
