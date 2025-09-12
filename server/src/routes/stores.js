import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const router = Router();

router.get('/', async (req, res) => {
	const { q, userId } = req.query;
	const where = q ? { OR: [
		{ name: { contains: q, mode: 'insensitive' } },
		{ address: { contains: q, mode: 'insensitive' } }
	] } : {};
	const stores = await prisma.store.findMany({ where, include: { ratings: true } });
	const data = stores.map(s => ({
		id: s.id,
		name: s.name,
		address: s.address,
		overallRating: s.ratings.length ? s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length : 0,
		userRating: userId ? (s.ratings.find(r => r.userId === userId)?.value ?? null) : null
	}));
	res.json(data);
});

router.post('/:storeId/rate', async (req, res) => {
	const { storeId } = req.params;
	const schema = z.object({ value: z.number().min(1).max(5), userId: z.string() });
	const parsed = schema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const { value, userId } = parsed.data;
	const rating = await prisma.rating.upsert({
		where: { userId_storeId: { userId, storeId } },
		update: { value },
		create: { value, userId, storeId }
	});
	res.status(201).json(rating);
});

export default router;


