import { Router } from 'express';
import { z } from 'zod';
import { Report } from '../../models/Report.js';
import { Customer } from '../../models/Customer.js';
import { Invoice } from '../../models/Invoice.js';
import { Ticket } from '../../models/Ticket.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { generateReportPdf } from '../../services/pdfGenerator.js';

const router = Router(); const generateInput = z.object({ type: z.enum(['weekly', 'executive']).default('weekly'), title: z.string().trim().min(3).optional(), summary: z.string().trim().min(3).optional(), recommendations: z.array(z.string().trim()).default([]) });
router.use(requireAuth);
router.get('/', async (_req, res, next) => { try { res.json({ reports: await Report.find().sort({ createdAt: -1 }).populate('generatedBy', 'name email') }); } catch (error) { next(error); } });
router.get('/:id', async (req, res, next) => { try { const report = await Report.findById(req.params.id).populate('generatedBy', 'name email'); if (!report) return res.status(404).json({ message: 'Report not found.' }); res.json({ report }); } catch (error) { next(error); } });
router.post('/generate', validate(generateInput), async (req, res, next) => {
  try {
    const [customerCount, invoices, openTickets] = await Promise.all([Customer.countDocuments(), Invoice.find(), Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } })]);
    const totalRevenue = invoices.reduce((total, invoice) => total + invoice.amount, 0); const collectedRevenue = invoices.filter((invoice) => invoice.status === 'paid').reduce((total, invoice) => total + invoice.amount, 0);
    const report = await Report.create({ type: req.body.type, title: req.body.title || `${req.body.type === 'executive' ? 'Executive' : 'Weekly'} NxtBiz Operations Report`, summary: req.body.summary || `NxtBiz currently tracks ${customerCount} customers, ${openTickets} open support tickets, and ${totalRevenue} in invoiced revenue.`, recommendations: req.body.recommendations, metrics: { customerCount, totalRevenue, collectedRevenue, openTickets }, generatedBy: req.user.id }); report.pdfUrl = await generateReportPdf(report); await report.save();
    res.status(201).json({ report });
  } catch (error) { next(error); }
});
export default router;
