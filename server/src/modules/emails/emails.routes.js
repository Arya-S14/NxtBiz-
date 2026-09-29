import { Router } from 'express';
import { z } from 'zod';
import { Email } from '../../models/Email.js';
import { Customer } from '../../models/Customer.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { analyzeEmail } from '../../services/emailIntelligence.js';
import { dispatchOrchestration } from '../../queues/orchestration.js';

const router = Router(); const input = z.object({ subject: z.string().trim().min(1), body: z.string().min(1), sender: z.string().email(), customerId: z.string().optional() }); router.use(requireAuth);
router.get('/', async (_req, res, next) => { try { res.json({ emails: await Email.find().sort({ createdAt: -1 }).populate('customerId', 'name company') }); } catch (error) { next(error); } });
router.get('/:id', async (req, res, next) => { try { const email = await Email.findById(req.params.id).populate('customerId', 'name company email'); if (!email) return res.status(404).json({ message: 'Email not found.' }); res.json({ email }); } catch (error) { next(error); } });
router.post('/process', validate(input), async (req, res, next) => { try { if (req.body.customerId && !await Customer.exists({ _id: req.body.customerId })) return res.status(404).json({ message: 'Customer not found.' }); const email = await Email.create({ ...req.body, sender: req.body.sender.toLowerCase(), ...analyzeEmail(req.body) }); const orchestration = await dispatchOrchestration({ emailId: email.id, userId: req.user.id, app: req.app }); res.status(201).json({ email, orchestration }); } catch (error) { next(error); } });
export default router;
