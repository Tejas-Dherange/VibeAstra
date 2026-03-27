const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.food.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPass = await bcrypt.hash('admin123', 10);
  const studentPass = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: adminPass,
      role: 'ADMIN',
      interests: ['management', 'events'],
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Arjun Sharma',
      email: 'arjun@campus.edu',
      password: studentPass,
      role: 'STUDENT',
      interests: ['web-dev', 'ai', 'hackathon'],
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@campus.edu',
      password: studentPass,
      role: 'STUDENT',
      interests: ['finance', 'consulting'],
    },
  });

  console.log('✅ Users created');

  // Events - use future dates relative to seed time
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in1Week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      {
        title: 'National Level Hackathon 2024',
        description: 'Build innovative solutions for real-world problems. Open to all branches.',
        date: tomorrow,
        category: 'hackathon',
      },
      {
        title: 'Web Development Workshop',
        description: 'Hands-on React and Node.js workshop by senior students.',
        date: in3Days,
        category: 'web-dev',
      },
      {
        title: 'AI/ML Seminar: LLMs & Agents',
        description: 'Explore the world of Large Language Models and AI Agents.',
        date: in2Hours,
        category: 'ai',
      },
      {
        title: 'Cultural Fest – TechnoSpree',
        description: 'Annual cultural and technical festival with 50+ events.',
        date: in1Week,
        category: 'cultural',
      },
      {
        title: 'Finance & Stock Market Club',
        description: 'Learn about equity analysis, trading strategies and portfolio management.',
        date: in3Days,
        category: 'finance',
      },
    ],
  });

  console.log('✅ Events created');

  // Bus timings
  const busIn5Mins = new Date(now.getTime() + 5 * 60 * 1000);
  const busIn20Mins = new Date(now.getTime() + 20 * 60 * 1000);
  const busIn45Mins = new Date(now.getTime() + 45 * 60 * 1000);
  const busIn90Mins = new Date(now.getTime() + 90 * 60 * 1000);

  await prisma.bus.createMany({
    data: [
      {
        route: 'Route A – City Center → Campus',
        arrivalTime: busIn5Mins,
        status: 'on-time',
      },
      {
        route: 'Route B – Railway Station → Campus',
        arrivalTime: busIn20Mins,
        status: 'on-time',
      },
      {
        route: 'Route C – Campus → City Center',
        arrivalTime: busIn45Mins,
        status: 'delayed',
      },
      {
        route: 'Route D – Campus → Airport Road',
        arrivalTime: busIn90Mins,
        status: 'on-time',
      },
    ],
  });

  console.log('✅ Bus timings created');

  // Food / Mess menu
  await prisma.food.createMany({
    data: [
      {
        menu: 'Breakfast: Poha, Chutney, Chai | Lunch: Dal, Roti, Rice, Sabzi | Dinner: Paneer Butter Masala, Naan, Salad',
        rating: 2.1,
      },
      {
        menu: 'Breakfast: Idli-Sambar, Filter Coffee | Lunch: Rajma-Chawal, Papad | Dinner: Mix Veg, Chapati',
        rating: 4.2,
      },
    ],
  });

  console.log('✅ Food menu created');

  // Placements
  const deadline2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const deadline1Day = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const deadline3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const deadline1Week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const p1 = await prisma.placement.create({
    data: {
      company: 'Amazon',
      role: 'SDE-1 (Backend)',
      description: 'Work on large-scale distributed systems. Strong DSA required.',
      deadline: deadline2Hours,
      ctc: '28 LPA',
      tags: ['web-dev', 'ai', 'backend'],
    },
  });

  const p2 = await prisma.placement.create({
    data: {
      company: 'Google',
      role: 'Software Engineer (L3)',
      description: 'Build and scale products used by billions. Focus on algorithms.',
      deadline: deadline1Day,
      ctc: '45 LPA',
      tags: ['ai', 'web-dev'],
    },
  });

  const p3 = await prisma.placement.create({
    data: {
      company: 'Goldman Sachs',
      role: 'Technology Analyst',
      description: 'FinTech solutions, trading systems, and data engineering.',
      deadline: deadline3Days,
      ctc: '22 LPA',
      tags: ['finance', 'backend'],
    },
  });

  await prisma.placement.create({
    data: {
      company: 'McKinsey & Co.',
      role: 'Business Analyst',
      description: 'Strategy consulting for Fortune 500 companies.',
      deadline: deadline1Week,
      ctc: '18 LPA',
      tags: ['consulting', 'finance'],
    },
  });

  console.log('✅ Placements created');

  // Applications
  await prisma.application.create({
    data: {
      userId: student1.id,
      placementId: p2.id,
      status: 'APPLIED',
    },
  });

  console.log('✅ Applications created');
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('  Admin  → admin@campus.edu   / admin123');
  console.log('  Student → arjun@campus.edu  / student123');
  console.log('  Student → priya@campus.edu  / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
