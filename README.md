# TaskPro Enterprise

Team task manager with MongoDB persistence, session-based API auth, automated In Motion time tracking, and balanced performance analytics.

## Quick Start

```bash
npm install
cp .env.example .env   # set MONGODB_URI
npm run dev
```

Open [http://localhost:3100](http://localhost:3100)

## Demo Admin

| Field | Value |
|-------|-------|
| Email | `reachus@vayuguard.com` |
| Password | `vgctpl_ad@2022` |
| MFA | `202208` |

Employees are created by admin in **Settings → Add employee** (credentials emailed or logged to console).

## Routes

| Path | Description |
|------|-------------|
| `/login`, `/mfa` | Auth flow (HTTP-only cookie session) |
| `/` | Role-aware dashboard |
| `/tasks` | Filterable task list + create |
| `/board` | Drag-and-drop Kanban (keyboard ← → on focused card) |
| `/tasks/:id` | Task details, subtasks, comments, timing |
| `/performance` | Balanced scores — team (admin) or self (employee); CSV export |
| `/chat` | Channels, reactions, mentions |
| `/settings` | Profile; admin employee CRUD + schedule exceptions |

## Features

- **Clean UI** — teal accent, Outfit + Fraunces, light surfaces
- **Status changes** — only via `POST /tasks/:id/transition` (server timer)
- **Business hours** — Mon–Sat 10:00–18:00 Asia/Kolkata; per-employee schedule exceptions (admin)
- **WFH** — same rules as office; location metadata only
- **Performance** — balanced-v1 scoring (30/30/20/10/10), analytics disclaimer
- **Legacy tasks** — `timingTrust: legacy` until re-certified via transitions

## Time & performance policy

- **Timer:** runs only while task is **In Progress**; stops in To Do, Review, Done
- **Certified hours:** server-calculated business time on transitions
- **Estimate lock:** frozen when work first enters In Progress; admin changes require audit reason
- **Reassignment:** timing segments split on assignee change

## Tech Stack

React 19 · TypeScript · Vite 6 · Tailwind 4 · React Router · Express · MongoDB · @dnd-kit

Sessions use **HTTP-only cookies**; API routes require authentication.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Express + Vite on port 3100 |
| `npm run build` | Production frontend build |
| `npm run build:server` | Build frontend + bundle server |
| `npm run test:smoke` | Auth, timing, business-hours smoke tests |
| `npm run lint` | TypeScript check |

## Environment

- `MONGODB_URI` — MongoDB connection string (required)
- `MONGODB_DB` — database name (default `taskpro_vg`)
- `PORT` — server port (default `3100`)
