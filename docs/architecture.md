# Architecture

## Overview

Mssk_Talk is a serverless anonymous message board. There is no traditional backend server — all server-side logic runs as Cloudflare Pages Functions (edge workers). The database is Supabase (PostgreSQL with REST API).

```
Browser
  │
  ├── Static assets (HTML, CSS, JS, i18n JSON)
  │     Served by Cloudflare Pages CDN
  │
  └── API calls (/api/*)
        Handled by Cloudflare Pages Functions
              │
              ├── Supabase REST API (anon key)   — read/write messages, visitors, settings
              └── Supabase REST API (secret key) — write replies, update visitors, admin ops
```

## Request Flow

### User sends a message

```
User fills form → main.js → POST /api/message
  → message.js (Functions)
      1. Validate input (honeypot, rate limit, length)
      2. Resolve or create visitor UUID
      3. Check daily limit (query settings table)
      4. Check blocked words (query blocked_words table, secret key)
      5. INSERT into messages (is_word_blocked = true if matched)
      6. If not word-blocked: send notifications async (Telegram / email)
  → 200 { ok: true }
```

### Admin loads messages

```
Admin panel → admin.js → POST /api/admin { action: 'getMessages' }
  → admin.js (Functions)
      1. Verify ADMIN_PASSWORD via /api/auth
      2. Query messages with visitors JOIN, replies JOIN
      3. Apply filters (showBlocked, showWordBlocked, unreadOnly)
  → 200 [ ...messages ]
```

### Page loads config

```
Any page load → config.js (frontend) → GET /api/config
  → config.js (Functions)
      1. Fetch settings table (anon key)
      2. Fetch featured messages (is_featured = true)
      3. Fetch pinned messages (is_pinned = true)
      4. If featured_auto: supplement with random messages
  → 200 { settings, featuredBubbles, pinnedMessages }
```

## Key Design Decisions

**Why no build step?**
Simplicity. The project targets developers who want to self-host with minimal tooling. No bundler means no dependency lock-in, easier debugging in browser DevTools, and straightforward Cloudflare Pages deployment (output directory `/`).

**Why Supabase anon key in the browser?**
Row Level Security (RLS) policies enforce that anonymous users can only insert and select — they cannot update or delete. Operations that modify data (admin actions, visitor card updates) go through Functions that use the `service_role` secret key, which is never exposed to the browser.

**Why UUID in localStorage instead of cookies?**
Cookies can be blocked by browser privacy settings and are sent with every request. localStorage UUIDs are explicit, predictable, and align with the anonymous-by-design philosophy — the visitor controls their own identity. The tradeoff is that clearing localStorage loses message history.

**Why a separate `visitor.js` Function for card updates?**
Updating visitor profile fields (`nickname`, `avatar_url`, `bio`) requires the `service_role` key because the anon RLS policy only allows SELECT and INSERT on `visitors`. Rather than exposing the secret key or routing through `admin.js`, a dedicated endpoint with its own input validation keeps the surface area small.

**Why silent word-blocking instead of rejecting?**
Rejecting messages with blocked words tells the sender exactly which words to avoid. Silent interception + admin review gives the admin full control without signaling the moderation policy to bad actors.

## Security Model

| Operation | Key used | Where |
|-----------|----------|-------|
| Read settings, read messages (user-facing) | `anon` | Browser → Supabase direct |
| Send message | `anon` | Browser → `/api/message` → Supabase |
| Admin all operations | `service_role` | Browser → `/api/admin` → Supabase |
| Update visitor card | `service_role` | Browser → `/api/visitor` → Supabase |
| Check blocked words | `service_role` | `/api/message` → Supabase |

The `service_role` key is only ever used inside Functions (server-side). It is stored as a Cloudflare Pages environment variable and never included in any response.

Admin authentication uses a simple password check in `/api/auth`. The password is compared server-side; the browser receives a session token stored in `sessionStorage` (cleared on tab close).