import test from 'node:test';
import assert from 'node:assert/strict';
import { executeWorkflow } from './workflowExecutor.js';

test('executeWorkflow records a completed log when the condition matches', async () => {
  const workflow = {
    id: 'wf-1',
    name: 'Demo workflow',
    trigger: 'email_received',
    condition: 'urgent',
    action: 'create ticket and notify',
    enabled: true,
    logs: [],
    async save() {
      return this;
    }
  };

  const result = await executeWorkflow({
    workflowId: workflow.id,
    payload: { customerId: 'customer-123', issue: 'urgent escalation', priority: 'high' },
    userId: 'user-123',
    workflowModel: {
      findById: async () => workflow
    },
    ticketModel: {
      create: async (data) => ({ id: 'ticket-1', ...data })
    },
    notificationCreator: async () => ({ ok: true })
  });

  assert.equal(result.status, 'completed');
  assert.equal(result.workflow.logs.at(-1).status, 'completed');
  assert.equal(result.actions.length, 2);
});
