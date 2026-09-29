import crypto from 'node:crypto';
import { Email } from '../models/Email.js';
import { Agent } from '../models/Agent.js';
import { AgentExecution } from '../models/AgentExecution.js';
import { CRMActivity } from '../models/CRMActivity.js';
import { Meeting } from '../models/Meeting.js';
import { Invoice } from '../models/Invoice.js';
import { Ticket } from '../models/Ticket.js';
import { Memory } from '../models/Memory.js';
import { Customer } from '../models/Customer.js';
import { analyzeEmail } from './emailIntelligence.js';
import { createNotification } from './notifications.js';

export const agentDefinitions = [{ agentId: 'intent-agent', name: 'Intent Agent', capabilities: ['email classification'] }, { agentId: 'task-planner-agent', name: 'Task Planner Agent', capabilities: ['task planning'] }, { agentId: 'email-agent', name: 'Email Agent', capabilities: ['sales follow-up'] }, { agentId: 'crm-agent', name: 'CRM Agent', capabilities: ['CRM activity'] }, { agentId: 'meeting-agent', name: 'Meeting Agent', capabilities: ['meeting scheduling'] }, { agentId: 'invoice-agent', name: 'Invoice Agent', capabilities: ['invoice preparation'] }, { agentId: 'customer-support-agent', name: 'Customer Support Agent', capabilities: ['support escalation'] }, { agentId: 'chief-of-staff-agent', name: 'Chief of Staff Agent', capabilities: ['operational summary'] }];
const planFor = (intent) => ({ schedule_meeting: ['meeting-agent'], invoice_request: ['invoice-agent'], support_request: ['customer-support-agent'], sales_opportunity: ['email-agent'] }[intent] || []).concat(['crm-agent', 'chief-of-staff-agent']);

export function resolveCustomerId({ email, customerId, customerLookup }) {
  if (customerId) return customerId;
  if (customerLookup?._id) return customerLookup._id.toString();
  if (email?.sender) {
    const sender = email.sender.toLowerCase();
    const customer = customerLookup || null;
    if (customer?.email && customer.email.toLowerCase() === sender) return customer._id.toString();
  }
  return null;
}

export function resolveNotificationTargetPath(type, metadata = {}) {
  if (type === 'invoice_created' || metadata?.entityType === 'invoice') return '/invoices';
  if (type === 'meeting_created' || metadata?.entityType === 'meeting') return '/meetings';
  if (type === 'agent_completed' || metadata?.entityType === 'email') return '/emails';
  return '/';
}

async function execute(agentId, eventId, input, task) {
  const execution = await AgentExecution.create({ agentId, eventId, input, logs: ['Execution started.'] }); await Agent.findOneAndUpdate({ agentId }, { $set: { status: 'running' }, $setOnInsert: agentDefinitions.find((agent) => agent.agentId === agentId) }, { upsert: true, new: true });
  try { const output = await task(); execution.status = 'completed'; execution.output = output || {}; execution.logs.push('Execution completed.'); execution.finishedAt = new Date(); await execution.save(); await Agent.findOneAndUpdate({ agentId }, { status: 'idle', lastExecution: execution.finishedAt, $push: { logs: `${execution.finishedAt.toISOString()}: completed` } }); return output; } catch (error) { execution.status = 'failed'; execution.error = error.message; execution.logs.push(`Execution failed: ${error.message}`); execution.finishedAt = new Date(); await execution.save(); await Agent.findOneAndUpdate({ agentId }, { status: 'failed', lastExecution: execution.finishedAt, $push: { logs: `${execution.finishedAt.toISOString()}: failed` } }); throw error; }
}

export async function orchestrateEmail({ emailId, userId, app }) {
  const email = await Email.findById(emailId); if (!email) throw new Error('Email not found.'); const eventId = crypto.randomUUID(); const customerLookup = email.customerId ? await Customer.findById(email.customerId) : await Customer.findOne({ email: email.sender.toLowerCase() }); const resolvedCustomerId = resolveCustomerId({ email, customerId: email.customerId?.toString(), customerLookup });
  if (resolvedCustomerId && !email.customerId) { email.customerId = resolvedCustomerId; }
  const context = { emailId: email.id, customerId: resolvedCustomerId, subject: email.subject, sender: email.sender, body: email.body };
  const analysis = await execute('intent-agent', eventId, context, async () => analyzeEmail(email)); Object.assign(email, analysis); await email.save(); const plan = await execute('task-planner-agent', eventId, { ...context, intent: analysis.intent }, async () => ({ agents: planFor(analysis.intent) }));
  for (const agentId of plan.agents) { await execute(agentId, eventId, { ...context, analysis }, async () => {
    if (agentId === 'meeting-agent' && resolvedCustomerId) {
      const meeting = await Meeting.create({ title: `Follow-up: ${email.subject}`, attendees: [email.sender], startTime: new Date(), endTime: new Date(Date.now() + 30 * 60 * 1000), notes: email.autoResponse, customerId: resolvedCustomerId, status: 'scheduled' });
      await createNotification({ userId, type: 'meeting_created', title: 'Meeting created', message: meeting.title, metadata: { entityType: 'meeting', meetingId: meeting.id, emailId: email.id }, app });
      return meeting;
    }
    if (agentId === 'invoice-agent' && resolvedCustomerId) {
      const invoice = await Invoice.create({ customerId: resolvedCustomerId, amount: 0, dueDate: new Date(Date.now() + 30 * 86400000), status: 'draft', lineItems: [{ description: `Requested via email: ${email.subject}`, quantity: 1, unitPrice: 0 }] });
      await createNotification({ userId, type: 'invoice_created', title: 'Invoice created', message: `Invoice ${invoice.id} created for follow-up.`, metadata: { entityType: 'invoice', invoiceId: invoice.id, emailId: email.id }, app });
      return invoice;
    }
    if (agentId === 'customer-support-agent' && resolvedCustomerId) {
      const ticket = await Ticket.create({ customerId: resolvedCustomerId, priority: email.urgency, issue: email.subject, status: 'open' });
      await createNotification({ userId, type: 'new_ticket', title: 'Support ticket created', message: ticket.issue, metadata: { entityType: 'ticket', ticketId: ticket.id, emailId: email.id }, app });
      return ticket;
    }
    if (agentId === 'crm-agent' && resolvedCustomerId) return CRMActivity.create({ customerId: resolvedCustomerId, type: 'email', title: email.subject, body: email.body, metadata: { sentiment: email.sentiment, intent: email.intent, urgency: email.urgency }, createdBy: userId });
    if (agentId === 'chief-of-staff-agent') return Memory.create({ scope: 'email', customerId: resolvedCustomerId, agentId, key: `email:${email.id}`, value: `${email.intent}: ${email.subject}`, tags: [email.intent, email.urgency], source: 'agent-orchestration' });
    return { action: agentId, status: 'recorded' };
  }); }
  email.processed = true; await email.save(); await createNotification({ userId, type: 'agent_completed', title: 'Email orchestration completed', message: `Agents completed follow-up for "${email.subject}".`, metadata: { entityType: 'email', emailId: email.id, eventId }, app }); return { eventId, analysis, plan };
}
