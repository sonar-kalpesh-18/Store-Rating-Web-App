import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/my-store', async (req, res) => {
	const { ownerId } = req.query;
	if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });
	const store = await prisma.store.findUnique({ where: { ownerId }, include: { ratings: { include: { user: { select: { id: true, name: true, email: true } } } } } });
	if (!store) return res.status(404).json({ message: 'Store not found' });
	const average = store.ratings.length ? store.ratings.reduce((a, r) => a + r.value, 0) / store.ratings.length : 0;
	res.json({
		id: store.id,
		name: store.name,
		averageRating: average,
		ratings: store.ratings.map(r => ({ id: r.id, value: r.value, user: r.user }))
	});
});

export default router;


