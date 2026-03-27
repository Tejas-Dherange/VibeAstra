const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/bus
router.get('/', authenticate, async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({ orderBy: { arrivalTime: 'asc' } });
    res.json(buses);
  } catch {
    res.status(500).json({ message: 'Failed to fetch bus timings' });
  }
});

// POST /api/bus - Admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { route, arrivalTime, status } = req.body;
    if (!route || !arrivalTime) {
      return res.status(400).json({ message: 'Route and arrivalTime are required' });
    }
    const bus = await prisma.bus.create({
      data: { route, arrivalTime: new Date(arrivalTime), status: status || 'on-time' },
    });
    res.status(201).json(bus);
  } catch {
    res.status(500).json({ message: 'Failed to create bus route' });
  }
});

// PUT /api/bus/:id - Admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { route, arrivalTime, status } = req.body;
    const bus = await prisma.bus.update({
      where: { id: req.params.id },
      data: {
        ...(route && { route }),
        ...(arrivalTime && { arrivalTime: new Date(arrivalTime) }),
        ...(status && { status }),
      },
    });
    res.json(bus);
  } catch {
    res.status(500).json({ message: 'Failed to update bus route' });
  }
});

// DELETE /api/bus/:id - Admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.bus.delete({ where: { id: req.params.id } });
    res.json({ message: 'Bus route deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete bus route' });
  }
});

module.exports = router;
