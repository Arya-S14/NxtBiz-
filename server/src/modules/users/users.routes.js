import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, ROLES } from '../../models/User.js';
import { allowRoles, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt });
const createUser = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), password: z.string().min(8), role: z.enum(ROLES).default('Employee') });
const updateUser = z.object({ name: z.string().trim().min(2).max(100).optional(), email: z.string().email().optional(), role: z.enum(ROLES).optional(), active: z.boolean().optional() }).refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

router.use(requireAuth);
router.get('/', allowRoles('Admin', 'Manager'), async (_req, res, next) => {
  try { res.json({ users: (await User.find().sort({ name: 1 })).map(publicUser) }); } catch (error) { next(error); }
});
router.post('/', allowRoles('Admin'), validate(createUser), async (req, res, next) => {
  try {
    if (await User.exists({ email: req.body.email.toLowerCase() })) return res.status(409).json({ message: 'An account already uses this email.' });
    const user = await User.create({ ...req.body, email: req.body.email.toLowerCase(), passwordHash: await bcrypt.hash(req.body.password, 12) });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
router.put('/:id', allowRoles('Admin', 'Manager'), validate(updateUser), async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.email) update.email = update.email.toLowerCase();
    if (req.user.role === 'Manager' && (update.role || update.active !== undefined)) return res.status(403).json({ message: 'Managers cannot change roles or account activation.' });
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
router.delete('/:id', allowRoles('Admin'), async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

export default router;
