import { Router } from 'express';
import { Customer } from '../../models/Customer.js';
import { Invoice } from '../../models/Invoice.js';
import { Ticket } from '../../models/Ticket.js';
import { Meeting } from '../../models/Meeting.js';
import { CRMActivity } from '../../models/CRMActivity.js';
import { requireAuth } from '../../middleware/auth.js';
import { calculateBusinessHealthScore } from '../../services/healthScore.js';

const router = Router(); router.use(requireAuth);
router.get('/', async (_req, res, next) => {
  try {
    const [customerCount, invoiceStats, openTickets, upcomingMeetings, recentActivity, customerStats] = await Promise.all([
      Customer.countDocuments(),
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, collected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } } } }]),
      Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Meeting.countDocuments({ startTime: { $gte: new Date() }, status: 'scheduled' }),
      CRMActivity.find().sort({ createdAt: -1 }).limit(10).populate('customerId', 'name').populate('createdBy', 'name'),
      Customer.find({}, 'healthScore').lean()
    ]);
    const averageHealth = customerStats.length ? customerStats.reduce((total, customer) => total + (customer.healthScore || 0), 0) / customerStats.length : 50;
    const health = calculateBusinessHealthScore({
      customerSatisfaction: Math.min(100, Math.round(averageHealth)),
      responseTime: 78,
      invoiceCollection: invoiceStats[0]?.collected ? Math.min(100, Math.round((invoiceStats[0].collected / Math.max(invoiceStats[0].total, 1)) * 100)) : 60,
      ticketResolution: 82,
      leadConversion: 71,
      meetingMomentum: Math.min(100, Math.round((upcomingMeetings / Math.max(customerCount, 1)) * 100))
    });
    res.json({ metrics: { customers: customerCount, revenue: invoiceStats[0]?.total || 0, collected: invoiceStats[0]?.collected || 0, openTickets, upcomingMeetings, healthScore: health.score }, health, recentActivity });
  } catch (error) { next(error); }
});
export default router;
