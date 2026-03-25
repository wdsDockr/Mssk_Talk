# Changelog

All notable changes to this project will be documented here.

---

## [Unreleased]

---

## 2025-03

### Added
- Full internationalization (i18n) for both user-facing and admin panels
- Language switcher menu — replaces single toggle button; supports arbitrary number of languages
- Built-in Korean language pack (`kr.json`) contributed by community PR
- Fallback system: missing translation keys automatically fall back to Chinese base language
- Admin panel now reads saved language preference on load (shared with user-facing page)

### Changed
- `i18n.js` refactored: `LANGS` entries now include `label` field; added `langs()`, `nextLang()`, `labelOf()` APIs
- `SETTING_META` in `admin.js` converted to `getSettingMeta()` function so labels update on language switch

---

## 2025-02

### Added
- Visitor card profile: optional nickname, avatar URL, bio — saved locally and synced to database
- Admin panel displays visitor card info (avatar in group header, bio on expand, nickname in actions bar)
- Site title and description configurable from admin settings panel (previously hardcoded)
- Page-jump input on pagination — available when total pages > 3
- Blocked word management panel with add/delete; intercepted messages reviewable and releasable by admin
- Featured message management panel — view and unfeature all featured messages in one place
- Message pinning — admin can pin messages; pinned section shown on user page when enabled
- Floating message wall — featured messages displayed as animated bubbles in page background
- Admin reply system with edit/delete and optional email notification to visitor
- Visitor statistics panel: total visitors, today's new, 7-day message volume bar chart
- CSV export with scope selection and filter options (include/exclude blocked, word-filtered)
- Search result keyword highlighting
- Admin panel color scheme toggle (warm / cool)
- Dark mode support

### Changed
- CSS extracted to separate files: `css/main.css`, `css/admin.css`
- Settings panel layout changed to two-column grid to reduce whitespace
- `text` type settings now render as text input (previously incorrectly used number input)

### Fixed
- Site title no longer overwritten by i18n `_applyToDOM()` after language switch
- Image hosting tip text now follows language toggle
- Bubble animation speed reduced; uses `clientWidth/clientHeight` to avoid triggering scrollbar

---

## 2025-01

### Added
- Initial release
- Anonymous message board on Cloudflare Pages + Supabase
- Admin panel with message grouping, filtering, search, block/unblock
- Telegram and email (Resend) notification support
- Honeypot, IP rate limiting, daily message limit
- Light/dark theme toggle
- Chinese/English bilingual support