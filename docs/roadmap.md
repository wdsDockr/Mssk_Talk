# Roadmap & Design Decisions

This document records the project's direction, planned features, and the reasoning behind past decisions. It is a living document — update it when direction changes.

---

## Current State

Mssk_Talk is a self-hosted anonymous message board with a full admin panel. It is designed to be deployed by a single operator for their own use. The core principle is **zero infrastructure** — one Cloudflare Pages deployment and one Supabase project is all that's needed.

The project has reached a point where it is used by teams beyond the original author. This introduces new responsibilities around stability, contributor experience, and backwards compatibility.

---

## Guiding Principles

These should inform every feature decision:

1. **Anonymous by design** — features that compromise visitor anonymity are not added, even if technically convenient. IP bans are an example of something deliberately excluded.

2. **Zero-maintenance deployment** — the operator should not need to think about servers, scaling, or uptime. If a feature requires additional infrastructure, it needs strong justification.

3. **One JSON file per language** — internationalization should be achievable by anyone who speaks the language, with no coding required beyond adding a file and one line in `i18n.js`.

4. **Backwards-compatible schema changes** — existing deployments should not break when the project updates. All schema changes use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`.

5. **No build step** — the project should remain deployable by pointing Cloudflare Pages at a repository root. No bundler, no compiler, no pipeline required.

---

## Planned Features

### Public message board mode
**Status:** Planned  
**Description:** An optional setting that makes messages visible to all visitors, turning the board into a public comment section rather than a private inbox. Messages would be displayed in reverse-chronological order below the form.  
**Design considerations:**
- Needs a `is_public` flag on messages, defaulting to `false`
- Admin should be able to set default visibility and toggle per-message
- Blocked messages (`is_blocked`) must never appear publicly regardless of flag
- `word_blocked` messages must also never appear publicly
- Consider whether replies should be public too when the message is public

### Webhook notifications
**Status:** Done  
**Description:** Operators can configure a custom HTTP endpoint in the admin settings panel. A POST request is sent when a new message arrives, enabling integration with any service (Discord, Slack, custom systems) without adding first-party integrations.  
**Payload:** `event`, `timestamp`, `visitor_id` (short, 8 chars), `content`, `contact`, `image_url`.  
**Note:** Failures are silently ignored. No retry. Word-blocked messages do not fire webhook.

### i18n: auto-detect browser language
**Status:** Considering  
**Description:** On first visit, detect the browser's preferred language and switch to it automatically if a matching language pack exists. Fall back to the default language if no match.  
**Design considerations:**
- Use `navigator.language` or `navigator.languages`
- Only apply on first visit (no saved preference in localStorage)
- Must not override a previously saved preference

---

## Decided Against

### IP banning
Storing IP addresses contradicts the anonymous-by-design principle. The existing soft-block (UUID-based) is sufficient for the intended use case. If a visitor clears their localStorage, they get a new UUID — this is acceptable.

### File upload (direct to R2)
Allowing visitors to upload files directly introduces abuse risk (using the deployment as free storage) and adds operational complexity (R2 bucket, access policies, size limits). The current image URL approach delegates storage to the visitor and keeps the project's attack surface small.

### Multi-instance / multi-tenant
Supporting multiple operators from a single deployment would require significant architectural changes (per-instance auth, data isolation, billing). The self-hosted model is simpler and aligns better with the zero-infrastructure principle. Operators who want isolation should deploy their own instance.

### Document site (VitePress / Docusaurus)
The current scale does not justify a documentation site. Three README files and this `docs/` directory are sufficient. This decision should be revisited if the project develops a plugin system or multiple deployment modes.

---

## Past Decisions Worth Recording

### Why `is_word_blocked` instead of reusing `is_blocked`
Two separate flags allow distinguishing between "admin made a deliberate choice" and "system flagged automatically." This matters for the admin workflow — word-blocked messages appear in their own filter and have a "Release" action rather than "Unblock," which communicates the different intent clearly.

### Why settings are in the database rather than environment variables
Runtime-configurable settings (title, limits, feature flags) belong in the database so the admin can change them without redeploying. Environment variables are for secrets and infrastructure config that should not change at runtime.

### Why the admin panel shares the same `i18n.js` as the user page
A single internationalization system is easier to maintain than two separate ones. The admin panel loads `i18n.js` before any other script, and all strings use `I18n.t()` — the same pattern as the user page. The only difference is that `admin.js` reads the saved language on load rather than defaulting.

### Why `localStorage` for visitor UUID instead of a server-generated session
Server sessions require server-side storage or signed tokens, both of which add infrastructure. `localStorage` UUIDs are self-contained, require no server state, and give the visitor clear ownership of their identity — clearing the storage is a meaningful "reset" action.