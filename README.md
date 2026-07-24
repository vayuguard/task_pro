# TaskPro Enterprise

A simple, functional task manager with login, role-based access, and core team workflows.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password | MFA |
|------|-------|----------|-----|
| Admin | admin@taskpro.com | admin123 | Yes — use code `123456` |
| Employee | marcus@taskpro.com | employee123 | No |
| Employee | alex@taskpro.com | employee123 | No |

Click a demo account on the login page to auto-fill credentials.

## Authentication & Authorization

- **Login** — Email/password with session stored in `localStorage`
- **MFA** — Admin accounts require a 6-digit code after login (demo: `123456`)
- **Roles**
  - **Admin** — Full access: admin dashboard, performance analytics, create tasks
  - **Employee** — My tasks, kanban, task details, team chat, settings
- **Logout** — Clears session from sidebar or header menu

## Features

- Admin Dashboard — Team overview and project stats
- My Tasks — Personal task list with status filters
- Kanban Board — Drag tasks across columns
- Task Details — Subtasks, comments, attachments, activity
- Performance — Team metrics and work logs (admin only)
- Team Chat — Channel messaging
- Log Progress — Track hours against tasks

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS 4

Data persists in browser `localStorage`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run dev:server` | Start with Express API (optional) |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check |
