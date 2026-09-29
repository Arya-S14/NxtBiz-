import { Router } from 'express';
import { z } from 'zod';
import { Customer } from '../../models/Customer.js';
import { CRMActivity } from '../../models/CRMActivity.js';
import { Meeting } from '../../models/Meeting.js';
import { Invoice } from '../../models/Invoice.js';
import { Ticket } from '../../models/Ticket.js';
import { allowRoles, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
const customerInput = z.object({ name: z.string().trim().min(2), email: z.string().email(), phone: z.string().trim().optional(), company: z.string().trim().optional(), tags: z.array(z.string().trim()).default([]), notes: z.string().optional(), preferences: z.record(z.unknown()).default({}), healthScore: z.number().min(0).max(100).optional() });
const customerUpdate = customerInput.partial().refine((data) => Object.keys(data).length > 0, 'At least one field is required.');
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const query = req.query.search ? { $or: ['name', 'email', 'company'].map((field) => ({ [field]: { $regex: req.query.search, $options: 'i' } })) } : {};
    res.json({ customers: await Customer.find(query).sort({ updatedAt: -1 }) });
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    const [activities, meetings, invoices, tickets] = await Promise.all([CRMActivity.find({ customerId: customer.id }).sort({ createdAt: -1 }).limit(100).populate('createdBy', 'name'), Meeting.find({ customerId: customer.id }).sort({ startTime: -1 }), Invoice.find({ customerId: customer.id }).sort({ createdAt: -1 }), Ticket.find({ customerId: customer.id }).sort({ createdAt: -1 }).populate('assignedTo', 'name email')]);
    res.json({ customer, activities, meetings, invoices, tickets });
  } catch (error) { next(error); }
});
router.post('/', validate(customerInput), async (req, res, next) => {
  try { const customer = await Customer.create({ ...req.body, email: req.body.email.toLowerCase() }); res.status(201).json({ customer }); } catch (error) { next(error); }
});
router.put('/:id', validate(customerUpdate), async (req, res, next) => {
  try { const customer = await Customer.findByIdAndUpdate(req.params.id, { ...req.body, ...(req.body.email ? { email: req.body.email.toLowerCase() } : {}) }, { new: true, runValidators: true }); if (!customer) return res.status(404).json({ message: 'Customer not found.' }); res.json({ customer }); } catch (error) { next(error); }
});
router.delete('/:id', allowRoles('Admin', 'Manager'), async (req, res, next) => {
  try { const customer = await Customer.findByIdAndDelete(req.params.id); if (!customer) return res.status(404).json({ message: 'Customer not found.' }); res.status(204).end(); } catch (error) { next(error); }
});
export default router;
