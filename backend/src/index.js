require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const busRoutes = require('./routes/bus');
const foodRoutes = require('./routes/food');
const placementsRoutes = require('./routes/placements');
const smartFeedRoutes = require('./routes/smartFeed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/placements', placementsRoutes);
app.use('/api/smart-feed', smartFeedRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CampusCare backend running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
