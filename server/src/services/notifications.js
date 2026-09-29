import { Notification } from '../models/Notification.js';

export async function createNotification({ userId, type, title, message, metadata = {}, app }) {
  const notification = await Notification.create({ userId, type, title, message, metadata });
  const io = app?.get('io');
  io?.emit('notification', notification);
  if (['new_email', 'new_ticket', 'invoice_created', 'meeting_created', 'agent_completed', 'workflow_executed'].includes(type)) {
    io?.emit(type, notification);
  }
  return notification;
}
