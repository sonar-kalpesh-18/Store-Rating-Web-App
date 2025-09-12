import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { hashPassword, validatePasswordPolicy } from '../lib/password.js';

const router = Router();

router.get('/dashboard', async (_req, res) => {
	const [userCount, storeCount, ratingCount] = await Promise.all([
		prisma.user.count(),
		prisma.store.count(),
		prisma.rating.count()
	]);
	res.json({ userCount, storeCount, ratingCount });
});

router.get('/stores', async (req, res) => {
	const { q, sortBy = 'name', sortOrder = 'asc' } = req.query;
	const where = q
		? { OR: [
			{ name: { contains: q, mode: 'insensitive' } },
			{ email: { contains: q, mode: 'insensitive' } },
			{ address: { contains: q, mode: 'insensitive' } }
		] }
		: {};
	const stores = await prisma.store.findMany({
		where,
		orderBy: ['name', 'email', 'address', 'createdAt', 'updatedAt'].includes(String(sortBy)) ? { [String(sortBy)]: sortOrder } : undefined,
		include: { ratings: true, owner: { select: { id: true, name: true, email: true } } }
	});
	const data = stores.map(s => ({
		id: s.id,
		name: s.name,
		email: s.email,
		address: s.address,
		rating: s.ratings.length ? s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length : 0,
		owner: s.owner
	}));
	res.json(data);
});

router.get('/users', async (req, res) => {
	const { q, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
	const where = {};
	if (q) where.OR = [
		{ name: { contains: q, mode: 'insensitive' } },
		{ email: { contains: q, mode: 'insensitive' } },
		{ address: { contains: q, mode: 'insensitive' } }
	];
	if (role) where.role = role;
	const users = await prisma.user.findMany({
		where,
		orderBy: ['name', 'email', 'address', 'role', 'createdAt'].includes(String(sortBy)) ? { [String(sortBy)]: sortOrder } : undefined,
		include: { store: { include: { ratings: true } } }
	});
	const data = users.map(u => ({
		id: u.id,
		name: u.name,
		email: u.email,
		address: u.address,
		role: u.role,
		rating: u.store ? (u.store.ratings.length ? u.store.ratings.reduce((a, r) => a + r.value, 0) / u.store.ratings.length : 0) : undefined
	}));
	res.json(data);
});

router.post('/users', async (req, res) => {
	const schema = z.object({
		name: z.string().min(20).max(60),
		email: z.string().email(),
		address: z.string().max(400),
		password: z.string().min(8).max(16),
		role: z.enum(['ADMIN', 'USER', 'OWNER'])
	});
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const { name, email, address, password, role } = parsed.data;
	if (!validatePasswordPolicy(password)) return res.status(400).json({ message: 'Password does not meet policy' });
	const exists = await prisma.user.findUnique({ where: { email } });
	if (exists) return res.status(409).json({ message: 'Email already in use' });
	const hashed = await hashPassword(password);
	const user = await prisma.user.create({ data: { name, email, address, password: hashed, role } });
	return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post('/stores', async (req, res) => {
	const schema = z.object({ name: z.string(), email: z.string().email(), address: z.string(), ownerId: z.string() });
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const { name, email, address, ownerId } = parsed.data;
	const owner = await prisma.user.findUnique({ where: { id: ownerId } });
	if (!owner) return res.status(404).json({ message: 'Owner user not found' });
	if (owner.role !== 'OWNER' && owner.role !== 'ADMIN') return res.status(400).json({ message: 'User is not an OWNER' });
	const store = await prisma.store.create({ data: { name, email, address, ownerId } });
	res.status(201).json(store);
});

export default router;


