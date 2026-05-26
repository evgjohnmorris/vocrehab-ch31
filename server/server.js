import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import authorityRouter from './routes/authority.js';
import userRouter from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Setup body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// System status check endpoint
app.get('/api/status', (req, res) => {
  db.get('SELECT count(*) as count FROM authority_records', (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
    res.json({
      status: 'online',
      database: 'connected',
      recordsSeeded: row.count,
      timestamp: new Date().toISOString()
    });
  });
});

// Configure APIs
app.use('/api/authority', authorityRouter);
app.use('/api/user', userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`VR&E Portal Backend Server running on port ${PORT}`);
});
