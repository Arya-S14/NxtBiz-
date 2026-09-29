import { Router } from 'express';
import { z } from 'zod';
import { Ticket } from '../../models/Ticket.js';
import { Customer } from '../../models/Customer.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createNotification } from '../../services/notifications.js';

const router = Router(); const input = z.object({ customerId: z.string().min(1), priority: z.enum(['low', 'medium', 'high', 'critical']).optional(), issue: z.string().trim().min(3), status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(), assignedTo: z.string().nullable().optional(), resolution: z.string().optional() });
router.use(requireAuth);
router.get('/', async (_req, res, next) => { try { res.json({ tickets: await Ticket.find().sort({ createdAt: -1 }).populate('customerId', 'name company').populate('assignedTo', 'name email') }); } catch (error) { next(error); } });
router.post('/', validate(input), async (req, res, next) => { try { if (!await Customer.exists({ _id: req.body.customerId })) return res.status(404).json({ message: 'Customer not found.' }); const ticket = await Ticket.create(req.body); await createNotification({ userId: req.user.id, type: 'new_ticket', title: 'Support ticket created', message: ticket.issue, metadata: { entityType: 'ticket', ticketId: ticket.id }, app: req.app }); res.status(201).json({ ticket }); } catch (error) { next(error); } });
router.put('/:id', validate(input.partial()), async (req, res, next) => { try { const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!ticket) return res.status(404).json({ message: 'Ticket not found.' }); res.json({ ticket }); } catch (error) { next(error); } });
router.delete('/:id', async (req, res, next) => { try { const ticket = await Ticket.findByIdAndDelete(req.params.id); if (!ticket) return res.status(404).json({ message: 'Ticket not found.' }); res.status(204).end(); } catch (error) { next(error); } });
export default router;
