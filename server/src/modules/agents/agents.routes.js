import { Router } from 'express';
import { z } from 'zod';
import { Agent } from '../../models/Agent.js';
import { AgentExecution } from '../../models/AgentExecution.js';
import { requireAuth, allowRoles } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { agentDefinitions } from '../../services/orchestrator.js';
import { dispatchOrchestration } from '../../queues/orchestration.js';

const router = Router(); router.use(requireAuth); router.get('/', async (_req, res, next) => { try { await Promise.all(agentDefinitions.map((agent) => Agent.updateOne({ agentId: agent.agentId }, { $setOnInsert: agent }, { upsert: true }))); res.json({ agents: await Agent.find().sort({ agentId: 1 }) }); } catch (error) { next(error); } }); router.get('/executions', async (_req, res, next) => { try { res.json({ executions: await AgentExecution.find().sort({ startedAt: -1 }).limit(200) }); } catch (error) { next(error); } }); router.post('/run', allowRoles('Admin', 'Manager'), validate(z.object({ emailId: z.string().min(1) })), async (req, res, next) => { try { res.status(202).json({ orchestration: await dispatchOrchestration({ emailId: req.body.emailId, userId: req.user.id, app: req.app }) }); } catch (error) { next(error); } });
export default router;
