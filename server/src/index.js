import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import storeRoutes from './routes/stores.js';
import ownerRoutes from './routes/owner.js';
import { authenticate, requireRole } from './middleware/auth.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/admin', authenticate, requireRole('ADMIN'), adminRoutes);
app.use('/stores', authenticate, requireRole('USER', 'ADMIN'), storeRoutes);
app.use('/owner', authenticate, requireRole('OWNER', 'ADMIN'), ownerRoutes);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`);
});


