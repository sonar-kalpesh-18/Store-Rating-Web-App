import { verifyToken } from '../lib/jwt.js';

export function authenticate(req, res, next) {
	const auth = req.headers.authorization;
	if (!auth || !auth.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	try {
		const token = auth.slice('Bearer '.length);
		const payload = verifyToken(token);
		req.user = payload;
		return next();
	} catch (e) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

export function requireRole(...roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		return next();
	};
}


