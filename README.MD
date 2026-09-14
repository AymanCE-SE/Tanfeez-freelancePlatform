# Tanfeez — Technical README

Tanfeez is a full-stack freelance marketplace: clients post projects or order fixed-price services, freelancers propose or offer them, and both sides negotiate, chat, and rate each other in real time.

This document explains **how the system is built** — architecture, tech stack, and the key patterns used throughout. For a plain-language list of what the product actually does, see [`FEATURES.md`](./FEATURES.md).

---

## Tech Stack

**Backend**
- Python / Django 5.2 + Django REST Framework — REST API
- Django Channels + Daphne — WebSocket support (ASGI), for chat and live notifications
- Simple JWT — access + refresh token authentication
- SQLite (dev) — swap for PostgreSQL in production via `DATABASES` in `settings.py`

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
├── wsgi.py     # HTTP-only entrypoint (not used for chat/notifications)
└── urls.py     # REST route registry, one include() per app
```

Each Django app owns one domain (`project`, `service`, `project_proposal`, `service_proposal`, `chatroom`, `notification`, `client_rating`, `user`, `freelancer`, `client`, `skill`, `admin_dashboard`, `chatbot`) — models, serializers, views, and (for chat/notification) `consumers.py` + `routing.py` live together.

### Real-time: two independent WebSocket channels

| Channel | Purpose | Scope |
|---|---|---|
| `ws/chat/<room_id>/` | Messages, read receipts, online/last-seen presence | One connection per open conversation |
| `ws/notifications/` | Proposal/approval/completion/rating events, unread-message counts | One connection for the whole session, opened once on login via a React Context provider (`NotificationContext`) |

Both authenticate the same way: the JWT access token is passed as a query param on connect (`?token=...`), since browsers can't set custom headers on the WebSocket handshake. The token is validated manually in each consumer's `connect()` — there's no cookie-based session auth in this app.

Chat also does authorization on connect: a user is only allowed into a room if they're its `client` or `freelancer`. Presence (online/last-seen) is tracked in an in-memory dict per room — fine for a single dev process; a production deployment with multiple workers would need Redis as the channel layer and a shared presence store instead of `channels.layers.InMemoryChannelLayer`.

### Auth flow

1. `POST /api/user/login/` returns `access_token` + `refresh_token`.
2. The frontend's `apiClient` (`src/api/client.js`) attaches the access token to every request via a request interceptor.
3. On a 401, a response interceptor calls `POST /api/user/token/refresh/` once, de-duplicating concurrent refresh attempts with a shared in-flight promise, then retries the original request.
4. If refresh itself fails, local storage is cleared and the user is redirected to `/login`.

### The proposal → negotiation → completion → rating lifecycle

This is the core business flow, and it's the same shape for both projects and services:

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

`EngagementRating` is direction-aware (`client_to_freelancer` / `freelancer_to_client`) and scoped to either a project or a service, so a freelancer's rating on their profile (aggregated across everything) is deliberately kept separate from a single service's own rating (scoped to just that service) — matching how Upwork/Fiverr display trust signals.

### Notable backend conventions

- **Ownership checks live in `perform_create` / `perform_update` / `perform_destroy`**, not just in `permission_classes` — DRF's object-level permissions (`has_object_permission`) only fire for detail views (`get_object()`), never for `ListAPIView`, so list-scoped ownership is enforced manually.
- **`send_notification(recipient, notification_type, message, target_id, target_type)`** (`notification/utils.py`) is the single call site every app uses to both persist a `Notification` row and push it live over the recipient's personal WebSocket group (`user_<id>_notifications`). `target_type` (`project` / `service`) is what the frontend uses to route a notification click to the right page — it's required on every call, not inferred from `notification_type`.
- **IDs**: `CustomUser.id` (the login identity) is distinct from `Freelancer.id` / `Client.id` (profile-row ids). Most bugs early in this project's history came from mixing these up in API payloads — when in doubt, an endpoint that says "freelancer" without qualification means the `Freelancer` row id; "user" or "uid" means the `CustomUser` id.

### Frontend conventions

- **`src/api/client.js`** is the only place that builds requests — every other file in `src/api/` is a thin wrapper around it. Never call `axios` directly.
- **`src/context/NotificationContext.jsx`** owns the single notification WebSocket connection for the whole session and exposes `notifications`, `unreadCount`, `messagesUnreadCount`, and mark-as-read helpers via `useNotifications()`. It's mounted once in `MainLayout`, above the router, so it survives route changes.
- **Chat and Notifications both use the "server confirms, then refresh" pattern** rather than optimistic local updates for anything involving unread counts — e.g. marking a conversation read sends a WebSocket message, and the UI waits for the server's `read_receipt` echo before re-fetching counts, to avoid racing the server-side write.

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
├── context/                 # NotificationContext (session-wide WebSocket)
├── hooks/                   # useChatSocket, useNotificationSocket
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
`runserver` here is served by Daphne (via the `daphne` app in `INSTALLED_APPS`), so both REST and WebSocket traffic work from the same command — no separate ASGI server needed in dev.

Environment variables (`.env` in `backend/`): `SECRET_KEY`, `DEBUG`, database credentials if not using SQLite.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Environment variables (`.env` in `frontend/`, **not** `.env.production` — Vite ignores that file in dev mode):
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
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

WebSocket: `ws/chat/<room_id>/`, `ws/notifications/`.