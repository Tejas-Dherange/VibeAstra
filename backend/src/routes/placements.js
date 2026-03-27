const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/placements - Get all placements
router.get('/', authenticate, async (req, res) => {
  try {
    const placements = await prisma.placement.findMany({
      orderBy: { deadline: 'asc' },
    });

    // If student, attach application status
    if (req.user.role === 'STUDENT') {
      const applications = await prisma.application.findMany({
        where: { userId: req.user.id },
        select: { placementId: true, status: true },
      });
      const appMap = {};
      applications.forEach((a) => { appMap[a.placementId] = a.status; });
      const enriched = placements.map((p) => ({
        ...p,
        applicationStatus: appMap[p.id] || null,
      }));
      return res.json(enriched);
    }

    res.json(placements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch placements' });
  }
});

// POST /api/placements - Admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { company, role, description, deadline, ctc, tags } = req.body;
    if (!company || !role || !deadline) {
      return res.status(400).json({ message: 'Company, role, and deadline are required' });
    }
    const placement = await prisma.placement.create({
      data: {
        company,
        role,
        description: description || '',
        deadline: new Date(deadline),
        ctc: ctc || null,
        tags: tags || [],
      },
    });
    res.status(201).json(placement);
  } catch {
    res.status(500).json({ message: 'Failed to create placement' });
  }
});

// PUT /api/placements/:id - Admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { company, role, description, deadline, ctc, tags } = req.body;
    const placement = await prisma.placement.update({
      where: { id: req.params.id },
      data: {
        ...(company && { company }),
        ...(role && { role }),
        ...(description && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(ctc && { ctc }),
        ...(tags && { tags }),
      },
    });
    res.json(placement);
  } catch {
    res.status(500).json({ message: 'Failed to update placement' });
  }
});

// DELETE /api/placements/:id - Admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.placement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Placement deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete placement' });
  }
});

// POST /api/placements/:id/apply - Student applies
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can apply' });
    }
    const application = await prisma.application.upsert({
      where: {
        userId_placementId: {
          userId: req.user.id,
          placementId: req.params.id,
        },
      },
      update: { status: 'APPLIED' },
      create: {
        userId: req.user.id,
        placementId: req.params.id,
        status: 'APPLIED',
      },
    });
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to apply' });
  }
});

// GET /api/placements/my-applications - Student's applications
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: { placement: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

module.exports = router;
