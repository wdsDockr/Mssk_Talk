# API Reference

All endpoints are Cloudflare Pages Functions under `/api/`. They accept and return JSON.

---

## GET /api/config

Public. No authentication required.

Returns runtime configuration for the frontend. Called once on every page load.

**Response**
```json
{
  "settings": {
    "showHistory": false,
    "allowMessages": true,
    "requireContact": false,
    "maxMessageLength": 2000,
    "dailyLimit": 0,
    "showFeatured": false,
    "featuredCount": 10,
    "featuredAuto": true,
    "showReplies": true,
    "showPinned": true,
    "siteTitle": "留言给我",
    "siteDescription": "你的消息会以匿名方式送达"
  },
  "featuredBubbles": [
    { "id": "uuid", "content": "truncated to 20 chars…" }
  ],
  "pinnedMessages": [
    { "id": "uuid", "content": "full content", "created_at": "ISO8601" }
  ]
}
```

`featuredBubbles` is empty if `showFeatured` is false.
`pinnedMessages` is empty if `showPinned` is false.

---

## POST /api/message

Public. No authentication required.

Receives a new message from a visitor.

**Request body**
```json
{
  "visitorId": "uuid",
  "content": "message text",
  "imageUrl": "https://...",
  "contact": "optional contact info",
  "_hp": ""
}
```

`_hp` is the honeypot field — must be empty. Non-empty value causes silent rejection.

**Anti-spam checks (in order)**
1. Honeypot field must be empty
2. IP rate limit: max 3 requests per minute per IP
3. Minimum interval: 10 seconds between submissions from same IP
4. Content length ≤ `max_message_length` setting
5. Daily limit per `visitorId` (if `daily_limit` > 0)
6. Blocked word check (case-insensitive substring match)

**Response**
```json
{ "ok": true }
```

On rate limit: HTTP 429 with `{ "error": "..." }`.
On blocked visitor: HTTP 403 with `{ "error": "..." }`.

**Side effects**
- Creates visitor record if `visitorId` not found
- Sets `is_word_blocked: true` on message if blocked word matched
- Sends Telegram/email notification if message passes all checks

---

## POST /api/visitor?action=updateCard

Public (but requires valid `visitorId`). No admin auth.

Updates the visitor's card profile fields.

**Request body**
```json
{
  "visitorId": "uuid",
  "nickname": "optional",
  "avatarUrl": "https://...",
  "bio": "optional"
}
```

Any field can be `null` or empty string to clear it.

**Validation**
- `visitorId` must exist in the `visitors` table
- All fields trimmed; empty strings stored as `null`

**Response**
```json
{ "ok": true }
```

---

## Webhook

When `webhook_url` is set in admin settings, a POST request is sent to that URL for every new message that passes all checks (honeypot, rate limit, blocked words).

**Request**
```
POST {webhook_url}
Content-Type: application/json
```

**Payload**
```json
{
  "event": "new_message",
  "timestamp": "2025-03-01T12:00:00.000Z",
  "visitor_id": "a1b2c3d4",
  "content": "message text",
  "contact": "optional contact info or null",
  "image_url": "https://... or null"
}
```

**Notes**
- `visitor_id` is the first 8 characters of the UUID only — full UUID is never sent
- Failures are silently ignored and do not affect the message submission response
- No retry logic — if the endpoint is down, the notification is lost
- The endpoint must respond within Cloudflare's fetch timeout (~30s)
- Word-blocked messages do not trigger webhook (same as Telegram/email)

Used internally by the admin panel to verify the admin password.

**Request body**
```json
{ "password": "..." }
```

**Response**
```json
{ "ok": true }
```

HTTP 401 if password is wrong.

---

## POST /api/admin

Requires prior authentication via `/api/auth`. The admin panel sends the password in each request header — see `js/supabase.js` `_adminCall()` for implementation.

All admin operations use this single endpoint with an `action` field.

**Request shape**
```json
{
  "action": "actionName",
  "payload": { }
}
```

### Actions

| Action | Payload | Description |
|--------|---------|-------------|
| `getMessages` | `{ unreadOnly, showBlocked, showWordBlocked }` | Fetch all messages with visitor and reply info |
| `getStats` | — | Total messages, unread count, visitor count |
| `getVisitorStats` | — | Total visitors, today's new, 7-day message counts |
| `markRead` | `{ messageId }` | Mark message as read |
| `blockMessage` | `{ messageId, blocked }` | Set `is_blocked` on message |
| `blockVisitor` | `{ visitorId, blocked, blockMessages }` | Block/unblock visitor; optionally block all their messages |
| `saveNote` | `{ visitorId, note }` | Update visitor note |
| `setPinned` | `{ messageId, pinned }` | Set `is_pinned` on message |
| `setFeatured` | `{ messageId, featured }` | Set `is_featured` on message |
| `getFeaturedMessages` | — | All currently featured messages |
| `releaseWordBlocked` | `{ messageId }` | Clear `is_word_blocked` (release intercepted message) |
| `getReplies` | `{ messageId }` | Fetch all replies for a message |
| `addReply` | `{ messageId, content, contact, originalContent, notify }` | Create reply; send email if `notify: true` |
| `editReply` | `{ replyId, content }` | Update reply content, set `updated_at` |
| `deleteReply` | `{ replyId }` | Delete reply |
| `getBlockedWords` | — | All blocked words |
| `addBlockedWord` | `{ word }` | Add blocked word |
| `deleteBlockedWord` | `{ wordId }` | Remove blocked word |
| `getSettings` | — | All settings rows |
| `saveSetting` | `{ key, value }` | Update a setting value |