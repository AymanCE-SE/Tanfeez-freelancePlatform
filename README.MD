# Tanfeez — Technical README

Tanfeez is a full-stack freelance marketplace: clients post projects or order fixed-price services, freelancers propose or offer them, and both sides negotiate, chat, and rate each other in real time.

This document explains **how the system is built**. For a plain-language list of what the product does, see [`FEATURES.md`](./FEATURES.md).

---

## 🔗 Live Demo

**[tanfeez-freelance-platform.vercel.app](https://tanfeez-freelance-platform.vercel.app)**

Ready-made accounts, no need to register:

| Role | Email | Password |
|---|---|---|
| Freelancer | `Freelancer@mail.com` | `123654789` |
| Client | `Client@mail.com` | `123654789` |

Log in as the client to post a project or order a service; log in as the freelancer (in a second browser or an incognito window) to propose, accept, and chat back — that's the fastest way to see the negotiation → chat → completion → rating flow end to end.

> **Note on this deployment:** the demo backend runs on a free-tier host that doesn't support long-lived WebSocket connections, so chat and notifications here work over short polling (a few seconds' delay) instead of instantly. Locally, with the full Docker/Channels setup described below, both are genuinely real-time — see `deploy-polling-fallback` branch for the polling-adapted version used for this demo specifically, and `main` for the WebSocket-native version.

---

## Tech Stack

**Backend**
- Python / Django 5.2 + Django REST Framework — REST API
- Django Channels + Daphne — WebSocket support (ASGI), for chat and live notifications
- Simple JWT — access + refresh token authentication
- PostgreSQL (Neon, in the demo) — swap via `DATABASE_*` env vars for any Postgres instance
- Cloudinary — media storage (profile photos, service images), since container hosts typically wipe local disk between deploys
- Redis (Upstash, in the demo) — Channels' channel layer, for broadcasting across chat/notification WebSocket groups

**Frontend**
- React 19 + Vite
- Redux Toolkit — global state (auth, projects, services, proposals, chat, notifications)
- React Router 7
- React Bootstrap — UI components
- Axios — HTTP client, with a custom interceptor for auth and silent token refresh

---

## Architecture Overview

### Two transports, one backend
Most of the app is a conventional REST API (DRF), but two features need the server to *push* data to the client without being asked: chat messages and notifications. Those run over WebSockets via Django Channels, served by the same Django process through Daphne (`config/asgi.py`).

```
config/
├── asgi.py     # WebSocket + HTTP entrypoint (Daphne)
├── wsgi.py     # HTTP-only entrypoint
└── urls.py     # REST route registry, one include() per app
```

Each Django app owns one domain (`project`, `service`, `project_proposal`, `service_proposal`, `chatroom`, `notification`, `client_rating`, `user`, `freelancer`, `client`, `skill`, `admin_dashboard`, `chatbot`) — models, serializers, views, and (for chat/notification) `consumers.py` + `routing.py` live together.

### Real-time: two independent WebSocket channels

| Channel | Purpose | Scope |
|---|---|---|
| `ws/chat/<room_id>/` | Messages, read receipts, online/last-seen presence | One connection per open conversation |
| `ws/notifications/` | Proposal/approval/completion/rating events, unread-message counts | One connection for the whole session, opened once on login via a React Context provider (`NotificationContext`) |

Both authenticate by passing the JWT access token as a query param on connect (`?token=...`), since browsers can't set custom headers on the WebSocket handshake. Chat also authorizes on connect — a user may only join a room they're the `client` or `freelancer` of.

### The proposal → negotiation → completion → rating lifecycle

The core business flow, the same shape for both projects and services:

```
freelancer/client submits a proposal
        │
        ├── ChatRoom auto-created (is_negotiation=True)
        │
project/service owner approves
        │
        ├── ChatRoom flips to is_negotiation=False
        │
work happens, negotiated live in chat
        │
owner marks it finished/completed
        │
        ├── notification: "rate your counterpart" → both sides
        └── EngagementRating can now be submitted (rater/ratee/project-or-service/direction)
```

`EngagementRating` is direction-aware (`client_to_freelancer` / `freelancer_to_client`) and scoped to either a project or a service, so a freelancer's profile rating (aggregated across everything) stays deliberately separate from a single service's own rating (scoped to just that listing).

### Notable backend conventions

- **Ownership checks live in `perform_create` / `perform_update` / `perform_destroy`**, not just in `permission_classes` — DRF's object-level permissions only fire for detail views, never for `ListAPIView`, so list-scoped ownership is enforced manually.
- **`send_notification(recipient, notification_type, message, target_id, target_type)`** (`notification/utils.py`) is the single call site every app uses to persist a `Notification` row and push it live. `target_type` (`project` / `service`) is what the frontend uses to route a notification click correctly — required on every call.
- **IDs**: `CustomUser.id` (the login identity) is distinct from `Freelancer.id` / `Client.id` (profile-row ids). An endpoint that says "freelancer" without qualification usually means the `Freelancer` row id; "user" or "uid" means the `CustomUser` id.

### Frontend conventions

- **`src/api/client.js`** is the only place that builds requests — every other file in `src/api/` wraps it. Never call `axios` directly.
- **`src/context/NotificationContext.jsx`** owns the single notification connection for the whole session, mounted once in `MainLayout`, above the router.
- **Real-time vs. polling is a single switch**: `src/hooks/useChatRealtime.js` and `useNotificationRealtime.js` pick between the WebSocket hooks and REST-polling fallbacks based on `VITE_REALTIME_MODE` (`websocket` | `polling`), read once at build time. Every consuming component (`Chat.jsx`, `NotificationContext.jsx`) talks to these dispatcher hooks only, so switching hosting environments never requires touching UI code.

---

## Project Structure

```
backend/
├── config/                 # settings, root urls, asgi/wsgi entrypoints
├── user/                   # CustomUser model, auth, registration, profile
├── freelancer/ client/     # role-specific profile data (1:1 with CustomUser)
├── skill/                  # skills, linked to projects/freelancers
├── project/ project_proposal/     # project postings + freelancer proposals
├── service/ service_proposal/     # fixed-price service listings + client orders
├── chatroom/                # ChatRoom/Message models, WebSocket consumer
├── notification/            # Notification model, WebSocket consumer, send_notification()
├── client_rating/           # EngagementRating (bidirectional project/service ratings)
├── admin_dashboard/         # staff-facing aggregate views
└── chatbot/                 # AI chat assistant integration

frontend/src/
├── api/                     # one file per domain, all built on api/client.js
├── store/slices/            # Redux Toolkit slices, one per domain
├── context/                 # NotificationContext (session-wide WebSocket/polling)
├── hooks/                   # useChatRealtime, useNotificationRealtime, and their WS/polling implementations
├── components/               # organized by domain (chat/, rating/, proposals/, profile/, serviceDetails/, addproject/)
└── pages/                   # route-level components
```

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # or source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
`runserver` is served by Daphne (via the `daphne` app in `INSTALLED_APPS`), so both REST and WebSocket traffic work from the same command.

Required `.env` (in `backend/`): `SECRET_KEY`, `DEBUG`, `DATABASE_HOST`/`DATABASE_USER`/`DATABASE_PASSWORD`/`DATABASE_NAME`/`DATABASE_PORT`, `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, `REDIS_URL`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Required `.env` (in `frontend/`, **not** `.env.production` — Vite ignores that file in dev mode):
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
VITE_REALTIME_MODE=websocket
```

---

## API Surface (high level)

All endpoints below are prefixed `/api/`. See each app's `urls.py` for the full, current list.

| Prefix | Owns |
|---|---|
| `user/` | register, login, token refresh, profile |
| `project/`, `project-proposal/` | projects, proposals, approve/finish |
| `service/`, `service-proposal/` | services, orders, approve/complete |
| `chatroom/` | conversations, messages, unread counts |
| `notifications/` | notification history, mark read |
| `client-ratings/` | `EngagementRating` create/list/summary |
| `admin_dashboard/` | staff aggregate views |

WebSocket: `ws/chat/<room_id>/`, `ws/notifications/` (native WebSocket deployments only — see the Live Demo note above for the polling-mode alternative).