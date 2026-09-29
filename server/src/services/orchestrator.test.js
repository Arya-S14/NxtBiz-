import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCustomerId, resolveNotificationTargetPath } from './orchestrator.js';
import { analyzeEmail } from './emailIntelligence.js';

test('resolveCustomerId falls back to a matching customer by sender email', () => {
  const resolved = resolveCustomerId({
    email: { sender: 'maria@northwind.io' },
    customerId: null,
    customerLookup: { _id: 'customer-123', email: 'maria@northwind.io' }
  });

  assert.equal(resolved, 'customer-123');
});

test('resolveNotificationTargetPath maps domain events to the correct pages', () => {
  assert.equal(resolveNotificationTargetPath('invoice_created', {}), '/invoices');
  assert.equal(resolveNotificationTargetPath('meeting_created', {}), '/meetings');
  assert.equal(resolveNotificationTargetPath('agent_completed', {}), '/emails');
});

test('analyzeEmail recognizes invoice requests from natural-language email text', () => {
  const result = analyzeEmail({
    subject: 'Invoice request',
    body: 'Please send my invoice for the recent order urgently.'
  });

  assert.equal(result.intent, 'invoice_request');
  assert.equal(result.urgency, 'critical');
  assert.equal(result.autoResponse, 'We have received your invoice request and will send the details shortly.');
});
