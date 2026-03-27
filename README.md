<div align="center">

# 🎓 CampusCare
### Smart Campus Assistant

*A centralized, full-stack platform that solves fragmented campus systems through an intelligent, rule-based Smart Feed.*

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 🧩 Problem Statement

Campus life generates fragmented data across systems — missed bus timings, last-minute placement notices, unnoticed events, and daily mess updates all live in different places. Students constantly miss opportunities due to information overload or lack of a single, prioritized view.

**CampusCare** solves this with a **Smart Feed** — a rule-based intelligence engine that surfaces only the most relevant, time-sensitive alerts, personalized to each student's interests.

---

## 🏗️ Architecture Diagram

```mermaid
graph TB
    subgraph Client["🖥️ Frontend  (React + Vite · Port 5173)"]
        direction TB
        LP[Login / Signup Pages]
        DB[Dashboard · Smart Feed]
        EV[Events Page]
        PL[Placements Page]
        AP[Admin Panel]
        ZS[(Zustand Store\nAuth State)]
        AX[Axios\nAPI Layer]
    end

    subgraph Server["⚙️ Backend  (Express.js · Port 5000)"]
        direction TB
        MW[JWT Auth Middleware\n+ RBAC Guard]
        AR[/api/auth]
        SR[/api/smart-feed]
        ER[/api/events]
        PR[/api/placements]
        BR[/api/bus]
        FR[/api/food]
        SFE[Smart Feed Engine\nRule-based Logic]
    end

    subgraph DB_Layer["🗄️ Data Layer  (Neon PostgreSQL)"]
        direction LR
        UM[(User)]
        EVT[(Event)]
        BUS[(Bus)]
        FOOD[(Food)]
        PLACE[(Placement)]
        APP[(Application)]
    end

    LP -->|POST /auth/login| AX
    AX -->|Bearer JWT| MW
    MW --> AR & SR & ER & PR & BR & FR
    SR --> SFE
    SFE -->|Queries all tables| DB_Layer
    ER & PR & BR & FR -->|Prisma ORM| DB_Layer
    AR -->|bcrypt + JWT sign| UM
    ZS -.->|Persisted token| AX
```

---

## 🧠 Smart Feed Engine

The core feature — a **rule-based intelligence system** that runs entirely on the backend (`/api/smart-feed`) and returns prioritized alerts.

### Priority Rules

| Condition | Priority | Example Alert |
|-----------|----------|---------------|
| Placement deadline `< 2h` + user interested | 🔴 HIGH | *"🔥 Amazon deadline in 90 minutes — Apply NOW!"* |
| Placement deadline `< 24h` + user interested | 🟡 MEDIUM | *"⚠️ Google – SDE deadline in 18 hours"* |
| Bus arriving in `< 8 mins` | 🔴 HIGH | *"🚌 Leave NOW for Route A — arrives in 5 min"* |
| Bus arriving in `8–20 mins` | 🟡 MEDIUM | *"🕐 Leave in ~5 mins for Route B"* |
| Event starts in `< 3h` | 🔴 HIGH | *"📍 Starting SOON: AI/ML Seminar — in 40 minutes"* |
| Event tomorrow + user interested | 🟡 MEDIUM | *"📅 Tomorrow: Hackathon (Recommended for you)"* |
| Mess rating `< 2.5` | 🟡 MEDIUM | *"🍽️ Mess rating LOW today (2.1/5) — consider alternatives"* |
| Mess rating `≥ 4.0` | 🟢 NORMAL | *"😋 Great mess today! (4.2/5)"* |

### Personalization
Alerts are filtered by the student's `interests` array (set at signup). A placement tagged `['web-dev', 'ai']` only generates an alert for students who listed those interests.

---

## 📁 Project Structure

```
Indira/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── seed.js             # Mock data seeder
│   ├── src/
│   │   ├── index.js            # Express server entry point
│   │   ├── lib/
│   │   │   └── prisma.js       # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verify + RBAC guard
│   │   └── routes/
│   │       ├── auth.js         # /signup, /login, /me
│   │       ├── events.js       # CRUD events
│   │       ├── bus.js          # CRUD bus routes
│   │       ├── food.js         # CRUD mess menu
│   │       ├── placements.js   # CRUD + apply
│   │       └── smartFeed.js    # Rule-based alert engine
│   ├── .env                    # DATABASE_URL, JWT_SECRET
│   └── package.json
│
└── frontend/
    ├── index.html              # Entry HTML (Inter font, meta tags)
    ├── vite.config.js          # Vite + Tailwind v4 + API proxy
    └── src/
        ├── App.jsx             # React Router setup
        ├── main.jsx            # Root render
        ├── index.css           # Design system (CSS variables, utilities)
        ├── lib/
        │   └── api.js          # Axios instance (auto JWT header)
        ├── store/
        │   └── authStore.js    # Zustand auth store (persisted)
        ├── components/
        │   ├── Navbar.jsx      # Sticky nav + alert bell + user menu
        │   └── ProtectedRoute.jsx  # Auth + Admin route guards
        └── pages/
            ├── LoginPage.jsx   # Login with demo quick-fill
            ├── SignupPage.jsx  # Signup with interest picker
            ├── DashboardPage.jsx  # Smart Feed + stat cards
            ├── EventsPage.jsx  # Filter, search, time-left countdown
            ├── PlacementsPage.jsx  # Apply, deadline indicator
            └── AdminPage.jsx   # Tabbed CRUD panel
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User {
        String id PK
        String name
        String email
        String password
        Role   role
        String[] interests
    }
    Event {
        String id PK
        String title
        String description
        DateTime date
        String category
    }
    Bus {
        String id PK
        String route
        DateTime arrivalTime
        String status
    }
    Food {
        String id PK
        String menu
        Float  rating
        DateTime date
    }
    Placement {
        String id PK
        String company
        String role
        String description
        DateTime deadline
        String ctc
        String[] tags
    }
    Application {
        String id PK
        String userId FK
        String placementId FK
        ApplicationStatus status
    }

    User ||--o{ Application : "applies"
    Placement ||--o{ Application : "receives"
```

---

## 👥 Roles & Access Control

| Feature | Student | Admin |
|---------|---------|-------|
| Login / Signup | ✅ | ✅ |
| View Smart Feed | ✅ | ✅ |
| View Events | ✅ | ✅ |
| Apply to Placements | ✅ | ❌ |
| Create / Edit Events | ❌ | ✅ |
| Create / Edit Bus | ❌ | ✅ |
| Create / Edit Food | ❌ | ✅ |
| Create / Edit Placements | ❌ | ✅ |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET`  | `/api/auth/me` | Get current user |

### Smart Feed
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/smart-feed` | Student | Returns prioritized alert array + stats |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`    | `/api/events` | Any | List all (filter `?category=`) |
| `POST`   | `/api/events` | Admin | Create event |
| `PUT`    | `/api/events/:id` | Admin | Update event |
| `DELETE` | `/api/events/:id` | Admin | Delete event |

### Placements
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`    | `/api/placements` | Any | List all (student gets `applicationStatus`) |
| `POST`   | `/api/placements` | Admin | Create placement |
| `POST`   | `/api/placements/:id/apply` | Student | Apply |
| `DELETE` | `/api/placements/:id` | Admin | Delete |

### Bus & Food
Same CRUD pattern — `GET` (any), `POST/PUT/DELETE` (admin only).

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- A [Neon DB](https://neon.tech) PostgreSQL connection string

### 1. Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=5000
```

```bash
npx prisma db push      # Create tables
node prisma/seed.js     # Seed demo data
npm run dev             # Start on :5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # Start on :5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000` automatically.

---

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🎓 Student | `arjun@campus.edu` | `student123` |
| 🎓 Student | `priya@campus.edu` | `student123` |
| ⚙️ Admin | `admin@campus.edu` | `admin123` |

> The **login page has quick demo buttons** to autofill these credentials instantly.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + Vite 8 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| **Icons** | lucide-react |
| **State Management** | Zustand (with `persist` middleware) |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Routing** | React Router v7 |
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL on Neon (serverless) |
| **ORM** | Prisma v5 |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **Font** | Inter (Google Fonts) |
