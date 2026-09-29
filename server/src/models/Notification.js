import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, type: { type: String, required: true }, title: { type: String, required: true }, message: { type: String, required: true }, read: { type: Boolean, default: false }, metadata: { type: mongoose.Schema.Types.Mixed, default: {} } }, { timestamps: true });
export const Notification = mongoose.model('Notification', notificationSchema);
