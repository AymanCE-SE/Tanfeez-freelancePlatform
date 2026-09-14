# Tanfeez — Features & Roadmap

A plain-language list of what the platform does today, and what's planned next. For how it's built, see [`README.md`](./README.md).

---

## Who uses it

- **Clients** post projects or order fixed-price services from freelancers.
- **Freelancers** browse and propose on projects, or list services clients can order directly.
- Both sides negotiate over chat, get notified in real time, and rate each other once work is done.

---

## Core Features

### Accounts & Auth
- Registration and login as a client or freelancer, with JWT access + refresh tokens (silent refresh, no forced re-login on token expiry).
- Editable profile: photo, bio, contact info, role-specific fields (skills/CV for freelancers, company info for clients).
- Profile pages show a public-facing view of anyone's work history, ratings, and reviews.

### Projects (client posts, freelancers propose)
- Clients post a project (fixed price or hourly, with required skills, experience level, duration).
- Freelancers submit a proposal (cover letter, bid, timeline) — one proposal per freelancer per project.
- A public "who applied" list shows freelancer names and a short pitch preview to everyone; full bid details (price, timeline) stay visible only to the project's client.
- The client reviews full proposals in a details modal and approves one — this auto-assigns the freelancer, opens a dedicated negotiation chat, and locks out further proposals.
- The client marks the project finished when work is delivered, which prompts both sides to rate each other.
- Freelancers see their own submitted proposal's status on the project page at all times.

### Services (freelancer lists, clients order)
- Freelancers list a fixed-price service (photos, description, category).
- Clients place an order with a message and an offer price — negotiable via the auto-created chat before the freelancer accepts.
- The freelancer manages incoming orders from a dedicated "View Orders" page per service: accept, message/negotiate, or mark complete.
- Average rating is shown two ways: per-service (ratings tied to that specific listing) and on the freelancer's overall profile (aggregated across everything they've done) — so a freelancer's weaker service doesn't drag down their strongest one.

### Real-time Chat
- One conversation per proposal/order, auto-created and auto-linked to the relevant project or service.
- Live messaging over WebSocket, with delivery confirmed by persistence to the database (not just a socket echo).
- Read receipts and online/last-seen presence per conversation.
- Conversation list updates live (new-message previews, unread badges) and stays sorted by most recent activity — no manual refresh needed.
- Mobile-responsive: single-column view with a back button on small screens, full two-column layout on desktop.
- Tap a participant's name or photo in a chat to jump straight to their profile.

### Notifications
- A single persistent WebSocket connection (not per-page) delivers live notifications for: new proposals/orders, approvals, project/service completion, rating reminders, and "someone rated you."
- Unread badge on the bell icon and on the messages icon separately, both clearing correctly once read — no stale counts.
- Clicking a notification routes to the right page (project or service) automatically.

### Ratings & Reviews
- Bidirectional: clients rate freelancers, and freelancers rate clients back, after a project or service is marked complete.
- Ratings are tied to the specific engagement (which project or service) as well as to the person — enabling both a granular, per-listing rating and an aggregated, profile-level rating.
- Reviews (with photos and comments) display on both service pages and user profiles, filtered to the relevant direction (a freelancer's profile shows what clients said about them; a client's shows what freelancers said).
- No unrestricted "write a review anytime" form — a rating can only be submitted for a real, completed engagement, which is what makes the ratings trustworthy.

### Admin
- Staff-facing dashboard for aggregate oversight (users, projects, services, proposals).

---

## What's Next

Roughly in priority order:

1. **File/attachment sharing in chat** — sending documents, images, or work samples directly in a conversation (not yet built; the paperclip icon is currently a placeholder). Requires a `Message.attachment` field and a dedicated upload endpoint, since file transfer doesn't belong on the WebSocket's JSON protocol.
2. **Public demo deployment** — a hosted, read-only-friendly build (e.g. on Vercel) backed by seeded/mock data and a couple of ready-made test accounts, so the project can be shared and explored without anyone needing to run it locally.
3. **General UI polish pass** — ongoing; several pages (chat, header, project/service details) have already been reworked for responsiveness and consistency, more to follow.
4. **Performance**: a couple of profile-facing computed fields (like average chat-response time) currently recalculate on every profile view rather than being cached — fine at current scale, worth revisiting as usage grows.

---

## Known Design Decisions (so they don't get "fixed" by accident)

- **Project ownership uses `CustomUser.id`, but bids/proposals reference `Freelancer.id`/`Client.id`.** These are intentionally different — see the README's ID note. Any new endpoint dealing with "who owns this" should be explicit about which one it means.
- **Bid amounts are private to the project/service owner** even though "who applied" is public — this is deliberate (prevents competitors from seeing each other's pricing), not an oversight.
- **A rating requires a completed engagement.** There is no general-purpose review form; this is what keeps ratings meaningful.