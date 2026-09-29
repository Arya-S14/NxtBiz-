import { Router } from 'express';
import { z } from 'zod';
import { Meeting } from '../../models/Meeting.js';
import { Customer } from '../../models/Customer.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createNotification } from '../../services/notifications.js';

const router = Router(); const baseInput = z.object({ title: z.string().trim().min(2), attendees: z.array(z.string().trim()).default([]), startTime: z.coerce.date(), endTime: z.coerce.date(), notes: z.string().optional(), status: z.enum(['scheduled', 'completed', 'cancelled']).optional(), customerId: z.string().min(1) }); const input = baseInput.refine((data) => data.endTime > data.startTime, 'End time must be after start time.');
router.use(requireAuth);
router.get('/', async (_req, res, next) => { try { res.json({ meetings: await Meeting.find().sort({ startTime: 1 }).populate('customerId', 'name company') }); } catch (error) { next(error); } });
router.post('/', validate(input), async (req, res, next) => { try { if (!await Customer.exists({ _id: req.body.customerId })) return res.status(404).json({ message: 'Customer not found.' }); const meeting = await Meeting.create(req.body); await createNotification({ userId: req.user.id, type: 'meeting_created', title: 'Meeting created', message: meeting.title, metadata: { entityType: 'meeting', meetingId: meeting.id }, app: req.app }); res.status(201).json({ meeting }); } catch (error) { next(error); } });
router.put('/:id', validate(baseInput.partial()), async (req, res, next) => { try { const meeting = await Meeting.findById(req.params.id); if (!meeting) return res.status(404).json({ message: 'Meeting not found.' }); Object.assign(meeting, req.body); if (meeting.endTime <= meeting.startTime) return res.status(400).json({ message: 'End time must be after start time.' }); await meeting.save(); res.json({ meeting }); } catch (error) { next(error); } });
router.delete('/:id', async (req, res, next) => { try { const meeting = await Meeting.findByIdAndDelete(req.params.id); if (!meeting) return res.status(404).json({ message: 'Meeting not found.' }); res.status(204).end(); } catch (error) { next(error); } });
export default router;
