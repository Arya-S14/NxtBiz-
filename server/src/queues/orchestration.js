import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { orchestrateEmail } from '../services/orchestrator.js';

let queue; let worker;
export function configureOrchestrationQueue(app) {
  if (!env.redisUrl) { console.warn('NxtBiz: Redis is unavailable; agent orchestration will run synchronously.'); return; }
  const connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null }); queue = new Queue('agent-orchestration', { connection }); worker = new Worker('agent-orchestration', async (job) => orchestrateEmail({ ...job.data, app }), { connection, concurrency: 4 }); worker.on('error', (error) => console.error('NxtBiz orchestration worker error:', error.message));
}
export async function dispatchOrchestration({ emailId, userId, app }) {
  if (!queue) return orchestrateEmail({ emailId, userId, app });
  const job = await queue.add('orchestrate-email', { emailId, userId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 1000, removeOnFail: 500 });
  return { queued: true, jobId: job.id };
}
