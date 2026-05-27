import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import authorityRouter from './routes/authority.js';
import casesRouter from './routes/cases.js';
import libraryRouter from './routes/library.js';
import plansRouter from './routes/plans.js';
import userRouter from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...configuredOrigins
]);

// Setup CORS middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Setup body parsers
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

// System status check endpoint
app.get('/api/status', (req, res) => {
  db.get('SELECT count(*) as count FROM authority_records', (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }

    const recordsSeeded = row.count;
    const ready = recordsSeeded > 0;
    const payload = {
      status: ready ? 'online' : 'degraded',
      database: 'connected',
      ready,
      recordsSeeded,
      timestamp: new Date().toISOString()
    };

    if (!ready) {
      res.status(503).json({
        ...payload,
        reason: 'Database is connected but unseeded. Run `npm run seed` in the server directory.'
      });
      return;
    }

    res.json(payload);
  });
});

app.get('/api/readyz', (req, res) => {
  db.get('SELECT count(*) as count FROM authority_records', (err, row) => {
    if (err) {
      return res.status(500).json({ ready: false, error: err.message });
    }

    const ready = row.count > 0;
    res.status(ready ? 200 : 503).json({ ready, recordsSeeded: row.count });
  });
});

// Configure APIs
app.use('/api/authority', authorityRouter);
app.use('/api/cases', casesRouter);
app.use('/api/library', libraryRouter);
app.use('/api/plans', plansRouter);
app.use('/api/user', userRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`VR&E Portal Backend Server running on port ${PORT}`);
});

function shutdown() {
  server.close(() => {
    db.close(() => {
      process.exit(0);
    });
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
