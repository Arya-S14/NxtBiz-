import { Router } from 'express';
import { z } from 'zod';
import { Invoice } from '../../models/Invoice.js';
import { Customer } from '../../models/Customer.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { generateInvoicePdf } from '../../services/pdfGenerator.js';
import { createNotification } from '../../services/notifications.js';

const router = Router(); const lineItem = z.object({ description: z.string().trim().min(1), quantity: z.number().positive().default(1), unitPrice: z.number().min(0) }); const input = z.object({ customerId: z.string().min(1), amount: z.number().min(0), dueDate: z.coerce.date(), status: z.enum(['draft', 'sent', 'paid', 'overdue', 'void']).optional(), lineItems: z.array(lineItem).default([]) });
router.use(requireAuth);
router.get('/', async (_req, res, next) => { try { res.json({ invoices: await Invoice.find().sort({ createdAt: -1 }).populate('customerId', 'name company email') }); } catch (error) { next(error); } });
router.get('/:id', async (req, res, next) => { try { const invoice = await Invoice.findById(req.params.id).populate('customerId', 'name company email'); if (!invoice) return res.status(404).json({ message: 'Invoice not found.' }); res.json({ invoice }); } catch (error) { next(error); } });
router.post('/', validate(input), async (req, res, next) => { try { const customer = await Customer.findById(req.body.customerId); if (!customer) return res.status(404).json({ message: 'Customer not found.' }); const invoice = await Invoice.create(req.body); invoice.pdfUrl = await generateInvoicePdf(invoice, customer); await invoice.save(); await createNotification({ userId: req.user.id, type: 'invoice_created', title: 'Invoice created', message: `Invoice ${invoice.id} created for ${customer.name}.`, metadata: { entityType: 'invoice', invoiceId: invoice.id }, app: req.app }); res.status(201).json({ invoice }); } catch (error) { next(error); } });
router.get('/:id/download', async (req, res, next) => { try { const invoice = await Invoice.findById(req.params.id); if (!invoice) return res.status(404).json({ message: 'Invoice not found.' }); if (!invoice.pdfUrl) return res.status(404).json({ message: 'Invoice PDF not found.' }); res.redirect(invoice.pdfUrl); } catch (error) { next(error); } });
router.put('/:id', validate(input.partial()), async (req, res, next) => { try { const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!invoice) return res.status(404).json({ message: 'Invoice not found.' }); res.json({ invoice }); } catch (error) { next(error); } });
router.delete('/:id', async (req, res, next) => { try { const invoice = await Invoice.findByIdAndDelete(req.params.id); if (!invoice) return res.status(404).json({ message: 'Invoice not found.' }); res.status(204).end(); } catch (error) { next(error); } });
export default router;
