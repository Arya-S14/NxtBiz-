import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function requireAuth(req, res, next) {
  try {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = bearer || req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'Authentication is required.' });
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return res.status(401).json({ message: 'Session is no longer active.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token.' });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'You do not have permission for this action.' });
}
