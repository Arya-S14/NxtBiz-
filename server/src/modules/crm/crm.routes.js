import { Router } from 'express';
import { z } from 'zod';
import { CRMActivity } from '../../models/CRMActivity.js';
import { Customer } from '../../models/Customer.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
const activityInput = z.object({ customerId: z.string().min(1), type: z.string().trim().min(2), title: z.string().trim().min(2), body: z.string().optional(), metadata: z.record(z.unknown()).default({}) });
const noteInput = activityInput.omit({ type: true });
router.use(requireAuth);
router.get('/', async (req, res, next) => { try { const filter = req.query.customerId ? { customerId: req.query.customerId } : {}; res.json({ activities: await CRMActivity.find(filter).sort({ createdAt: -1 }).populate('customerId', 'name company').populate('createdBy', 'name email') }); } catch (error) { next(error); } });
async function createActivity(req, res, next, fallbackType) { try { const input = fallbackType ? { ...req.body, type: fallbackType } : req.body; if (!await Customer.exists({ _id: input.customerId })) return res.status(404).json({ message: 'Customer not found.' }); const activity = await CRMActivity.create({ ...input, createdBy: req.user.id }); res.status(201).json({ activity }); } catch (error) { next(error); } }
router.post('/note', validate(noteInput), (req, res, next) => createActivity(req, res, next, 'note'));
router.post('/activity', validate(activityInput), (req, res, next) => createActivity(req, res, next));
export default router;
