import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import carsRouter from './routes/cars';
import analyzeRouter from './routes/analyze';
import triageRouter from './routes/triage';
import rehashRouter from './routes/rehash';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('//cars', carsRouter);
app.use('//analyze-deal', analyzeRouter);
app.use('//triage', triageRouter);
app.use('//rehash', rehashRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
