import mongoose from 'mongoose';

export const ROLES = ['Admin', 'Manager', 'Employee', 'Viewer'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'Employee' },
  refreshTokenHash: { type: String, select: false },
  active: { type: Boolean, default: true },
  lastLoginAt: Date
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
