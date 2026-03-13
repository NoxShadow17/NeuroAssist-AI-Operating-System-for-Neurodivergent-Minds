import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import tasksRouter from './routes/tasks.js';
import brainDumpRouter from './routes/brainDump.js';
import focusSessionsRouter from './routes/focusSessions.js';
import userRouter from './routes/user.js';
import companionRouter from './routes/companion.js';
import writingRouter from './routes/writing.js';

const app = express();

// Normalize CLIENT_URL to remove trailing slash
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

// Middleware
app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NeuroAssist API', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NeuroAssist API', docs: '/health' });
});

// API Routes
app.use('/api/users', userRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/brain-dump', brainDumpRouter);
app.use('/api/focus-sessions', focusSessionsRouter);
app.use('/api/companion', companionRouter);
app.use('/api/writing', writingRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🧠 NeuroAssist API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready for realtime connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
