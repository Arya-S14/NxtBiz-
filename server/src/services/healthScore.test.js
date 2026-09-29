import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBusinessHealthScore } from './healthScore.js';

test('calculateBusinessHealthScore returns weighted factors and a composite score', () => {
  const result = calculateBusinessHealthScore({
    customerSatisfaction: 80,
    responseTime: 70,
    invoiceCollection: 90,
    ticketResolution: 85,
    leadConversion: 60,
    meetingMomentum: 75
  });

  assert.equal(result.score, 78.2);
  assert.deepEqual(result.factors, {
    customerSatisfaction: 80,
    responseTime: 70,
    invoiceCollection: 90,
    leadConversion: 60,
    ticketResolution: 85,
    meetingMomentum: 75
  });
});
