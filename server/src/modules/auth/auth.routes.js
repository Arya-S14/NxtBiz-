import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { env } from '../../config/env.js';
import { validate } from '../../middleware/validate.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/tokens.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();
const credentials = z.object({ email: z.string().email(), password: z.string().min(8) });
const registration = credentials.extend({ name: z.string().trim().min(2).max(100) });
const refreshCookie = { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production', path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 };
const accessCookie = { httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production', maxAge: 15 * 60 * 1000 };
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active });

async function sendSession(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  await user.save();
  res.cookie('refreshToken', refreshToken, refreshCookie).cookie('accessToken', accessToken, accessCookie).json({ user: publicUser(user), accessToken });
}

router.post('/register', validate(registration), async (req, res, next) => {
  try {
    if (await User.exists({ email: req.body.email.toLowerCase() })) return res.status(409).json({ message: 'An account already uses this email.' });
    const user = await User.create({ name: req.body.name, email: req.body.email, passwordHash: await bcrypt.hash(req.body.password, 12), role: 'Employee' });
    await sendSession(res, user);
  } catch (error) { next(error); }
});

router.post('/login', validate(credentials), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash +refreshTokenHash');
    if (!user || !user.active || !(await bcrypt.compare(req.body.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    user.lastLoginAt = new Date();
    await sendSession(res, user);
  } catch (error) { next(error); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Refresh token is required.' });
    const { sub } = verifyRefreshToken(token);
    const user = await User.findById(sub).select('+refreshTokenHash');
    if (!user || !user.active || !user.refreshTokenHash || !(await bcrypt.compare(token, user.refreshTokenHash))) return res.status(401).json({ message: 'Invalid refresh token.' });
    await sendSession(res, user);
  } catch (error) { next(error); }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try { req.user.refreshTokenHash = undefined; await req.user.save(); res.clearCookie('refreshToken', refreshCookie).clearCookie('accessToken', accessCookie).status(204).end(); } catch (error) { next(error); }
});

export default router;
