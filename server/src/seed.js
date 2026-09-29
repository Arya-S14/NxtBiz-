import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Customer } from './models/Customer.js';
import { Workflow } from './models/Workflow.js';
import { Agent } from './models/Agent.js';
import { agentDefinitions } from './services/orchestrator.js';

export async function seedDemoData() {
  const existingAdmin = await User.findOne({ email: 'admin@nxtbiz.local' });
  if (!existingAdmin) {
    const admin = await User.create({
      name: 'NxtBiz Admin',
      email: 'admin@nxtbiz.local',
      passwordHash: await bcrypt.hash('Admin12345', 12),
      role: 'Admin',
      active: true
    });
    console.info(`Seeded admin user: ${admin.email}`);
  }

  if (!(await Customer.exists({ email: 'maria@northwind.io' }))) {
    await Customer.create({
      name: 'Maria Chen',
      email: 'maria@northwind.io',
      company: 'Northwind Labs',
      phone: '+1 555-0112',
      tags: ['priority', 'renewal'],
      notes: 'High-value customer with an upcoming renewal.',
      preferences: { timezone: 'UTC-5' },
      healthScore: 82
    });
  }

  if (!(await Workflow.exists({ name: 'Negative Email Escalation' }))) {
    await Workflow.create({
      name: 'Negative Email Escalation',
      trigger: 'email_received',
      condition: 'urgent',
      action: 'create ticket and notify',
      steps: [
        { type: 'trigger', value: 'email_received' },
        { type: 'condition', value: 'urgent' },
        { type: 'action', value: 'create ticket and notify' }
      ],
      enabled: true,
      logs: []
    });
  }

  await Promise.all(agentDefinitions.map((agent) => Agent.updateOne({ agentId: agent.agentId }, { $setOnInsert: agent }, { upsert: true })));
}
