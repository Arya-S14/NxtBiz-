import { Workflow } from '../models/Workflow.js';
import { Ticket } from '../models/Ticket.js';
import { createNotification } from './notifications.js';

export async function executeWorkflow({
  workflowId,
  payload = {},
  userId,
  app,
  workflowModel = Workflow,
  ticketModel = Ticket,
  notificationCreator = createNotification
}) {
  const workflow = await workflowModel.findById(workflowId);
  if (!workflow) throw new Error('Workflow not found.');

  workflow.logs = workflow.logs || [];
  const serializedPayload = JSON.stringify(payload);
  const shouldSkip = !workflow.enabled || (workflow.condition && !serializedPayload.includes(workflow.condition));
  const logEntry = {
    status: shouldSkip ? 'skipped' : 'completed',
    message: shouldSkip ? (!workflow.enabled ? 'Workflow is disabled.' : 'Condition did not match payload.') : `Workflow action executed: ${workflow.action || ''}`,
    payload,
    createdAt: new Date()
  };

  workflow.logs.push(logEntry);
  if (shouldSkip) {
    await workflow.save?.().catch(() => undefined);
    return { workflow, status: 'skipped' };
  }

  const actions = [];
  if ((workflow.action || '').toLowerCase().includes('ticket') && payload.customerId) {
    actions.push(await ticketModel.create({ customerId: payload.customerId, priority: payload.priority || 'medium', issue: payload.issue || `Workflow: ${workflow.name}`, status: 'open' }));
  }
  if ((workflow.action || '').toLowerCase().includes('notify')) {
    await notificationCreator({ userId, type: 'workflow_executed', title: 'Workflow executed', message: workflow.name, metadata: { workflowId: workflow.id || workflow._id, payload }, app });
    actions.push({ notification: true });
  }

  await workflow.save?.().catch(() => undefined);
  app?.get('io')?.emit('workflow_executed', { workflowId: workflow.id || workflow._id, status: 'completed' });
  return { workflow, status: 'completed', actions };
}
