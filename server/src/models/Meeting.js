import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  attendees: [{ type: String, trim: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true }
}, { timestamps: true });

export const Meeting = mongoose.model('Meeting', meetingSchema);
