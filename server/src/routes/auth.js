import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { comparePassword, hashPassword, validatePasswordPolicy } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';

const router = Router();

const signupSchema = z.object({
	name: z.string().min(20).max(60),
	email: z.string().email(),
	address: z.string().max(400),
	password: z.string().min(8).max(16)
});

router.post('/signup', async (req, res) => {
	const body = signupSchema.safeParse(req.body);
	if (!body.success) return res.status(400).json({ errors: body.error.flatten() });
	const { name, email, address, password } = body.data;
	if (!validatePasswordPolicy(password)) return res.status(400).json({ message: 'Password does not meet policy' });
	const exists = await prisma.user.findUnique({ where: { email } });
	if (exists) return res.status(409).json({ message: 'Email already in use' });
	const hashed = await hashPassword(password);
	const user = await prisma.user.create({ data: { name, email, address, password: hashed, role: 'USER' } });
	const token = signToken({ userId: user.id, role: user.role });
	return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });
router.post('/login', async (req, res) => {
	const body = loginSchema.safeParse(req.body);
	if (!body.success) return res.status(400).json({ errors: body.error.flatten() });
	const { email, password } = body.data;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = await comparePassword(password, user.password);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const token = signToken({ userId: user.id, role: user.role });
	return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

const updatePasswordSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(8).max(16) });
router.post('/update-password', async (req, res) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const parsed = updatePasswordSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const { oldPassword, newPassword } = parsed.data;
	if (!validatePasswordPolicy(newPassword)) return res.status(400).json({ message: 'Password does not meet policy' });
	const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
	if (!user) return res.status(404).json({ message: 'User not found' });
	const ok = await comparePassword(oldPassword, user.password);
	if (!ok) return res.status(400).json({ message: 'Old password incorrect' });
	const hashed = await hashPassword(newPassword);
	await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
	return res.json({ message: 'Password updated' });
});

export default router;


