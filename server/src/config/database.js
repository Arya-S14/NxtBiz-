import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('NxtBiz: MONGODB_URI is not configured; database-backed routes are unavailable.');
    return;
  }
  await mongoose.connect(env.mongoUri);
  console.info('NxtBiz: MongoDB connected.');
}
