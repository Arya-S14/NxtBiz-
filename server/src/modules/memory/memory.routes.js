import { Router } from 'express';
import { Memory } from '../../models/Memory.js';
import { requireAuth } from '../../middleware/auth.js';
const router = Router(); router.use(requireAuth); router.get('/search', async (req, res, next) => { try { const query = req.query.q?.trim(); if (!query) return res.json({ memory: [] }); res.json({ memory: await Memory.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, createdAt: -1 }).limit(50) }); } catch (error) { next(error); } }); export default router;
