import { Notification } from '../models/Notification.js';
export async function createNotification({ userId, type, title, message, metadata = {}, app }) { const notification = await Notification.create({ userId, type, title, message, metadata }); app?.get('io')?.emit('notification', notification); return notification; }
