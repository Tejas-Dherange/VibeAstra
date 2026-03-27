# 🎓 CampusCare – Smart Campus Assistant

A centralized, full-stack campus platform with an **AI-like rule-based Smart Feed** that delivers prioritized alerts for placements, buses, events, and mess ratings.

---

## 🗂️ Project Structure

```
Indira/
├── backend/     ← Node.js + Express + Prisma
└── frontend/    ← React + Vite + Tailwind CSS
```

---

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
```

**Configure your Neon DB** — edit `backend/.env`:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
JWT_SECRET="campuscare-super-secret-jwt-key-2024"
PORT=5000
```

**Push schema & seed data:**
```bash
npx prisma db push
node prisma/seed.js
```

**Start backend:**
```bash
npm run dev
```
→ Runs on `http://localhost:5000`

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```
→ Runs on `http://localhost:5173`

---

## 🧪 Demo Accounts

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@campus.edu     | admin123    |
| Student | arjun@campus.edu     | student123  |
| Student | priya@campus.edu     | student123  |

> Or use the **Quick Demo** buttons on the login page.

---

## ✨ Features

### 🧠 Smart Feed (Rule-based AI)
- `deadline < 3h` → 🔥 HIGH priority placement alert
- `bus arrival < 8 mins` → 🚌 Urgent bus alert
- `event in < 3h` → 📍 Starting soon alert
- `mess rating < 2.5` → 🍽️ Low quality warning
- `user interest matches tag` → personalized recommendations

### 📱 Pages
- **Dashboard** – Smart Feed + stats overview
- **Events** – Filter by category, search, time-left countdown
- **Placement Tracker** – Apply directly, deadline indicators
- **Admin Panel** – Full CRUD for all modules

---

## 🗄️ Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React + Vite + Tailwind CSS       |
| State    | Zustand (persisted)               |
| Backend  | Node.js + Express.js              |
| Database | PostgreSQL (Neon DB)              |
| ORM      | Prisma                            |
| Auth     | JWT + bcryptjs (RBAC)             |
| Icons    | lucide-react                      |

---

## 📡 API Endpoints

| Method | Route                    | Auth     |
|--------|--------------------------|----------|
| POST   | /api/auth/signup         | Public   |
| POST   | /api/auth/login          | Public   |
| GET    | /api/smart-feed          | Student  |
| GET    | /api/events              | Student  |
| POST   | /api/events              | Admin    |
| GET    | /api/placements          | Student  |
| POST   | /api/placements/:id/apply| Student  |
| GET    | /api/bus                 | Student  |
| GET    | /api/food                | Student  |
| DELETE | /api/events/:id          | Admin    |
