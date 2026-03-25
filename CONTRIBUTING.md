# Contributing to Mssk_Talk

Thank you for your interest in contributing. This document covers the most common contribution scenarios.

---

## Adding a New Language

This is the most common contribution and takes about 10 minutes.

**1. Copy the base language file**

```bash
cp i18n/zh.json i18n/xx.json
```

Replace `xx` with the [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (e.g. `ja` for Japanese, `de` for German).

**2. Translate the values**

Open `i18n/xx.json` and translate all the string values. Do not change the keys.

```json
{
  "form": {
    "submit": "Send"   ← translate this
  }
}
```

A few notes:
- Keys ending in `_placeholder` are used as HTML `placeholder` attributes — keep them concise
- Keys in `admin.csv_*` are CSV column headers — short is better
- If you're unsure about a string, leaving it untranslated is fine — the fallback system will show Chinese automatically
- Emoji in values (like `💬`, `✨`, `📌`) should be kept as-is unless they're culturally inappropriate

**3. Register the language in `i18n.js`**

```javascript
const LANGS = {
  zh: { url: './i18n/zh.json', label: '中文' },
  en: { url: './i18n/en.json', label: 'English' },
  kr: { url: './i18n/kr.json', label: '한국어' },
  xx: { url: './i18n/xx.json', label: 'Your language name' },  // ← add this
};
```

The `label` is what appears in the language switcher menu — use the native name of the language (e.g. `日本語` not `Japanese`).

**4. Open a pull request**

Include both the new `i18n/xx.json` and the updated `i18n.js` in your PR.

---

## Reporting a Bug

Please [open an issue](https://github.com/MaoShiSanKe/Mssk_Talk/issues/new) and include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and device (if relevant)

For security issues, please do not open a public issue — contact the maintainer directly.

---

## Suggesting a Feature

Open an issue with a short description of the feature and the problem it solves. No formal template required.

---

## Submitting a Pull Request

- Keep PRs focused — one feature or fix per PR
- Test your changes before submitting
- If you're adding a user-visible string, add the key to `i18n/zh.json` (Chinese base) and `i18n/en.json` at minimum
- Update `CHANGELOG.md` under `[Unreleased]` with a brief description of your change

---

## Key Naming Conventions for i18n

| Prefix | Used for |
|--------|----------|
| `form.*` | User-facing form labels, placeholders, buttons |
| `feedback.*` | Success/error messages shown to user |
| `history.*` | Message history section |
| `admin.*` | All admin panel strings |
| `admin.setting_*` | Settings panel labels and descriptions |
| `admin.csv_*` | CSV export column headers |

Keys use `snake_case`. Descriptions (shown as helper text below a setting) use the same key with `_desc` suffix.

---

## Project Structure Overview

See [README.md](./README.md#project-structure) for a full file listing.

The core files you're most likely to touch:

| File | Purpose |
|------|---------|
| `i18n/zh.json` | Base language — add new keys here first |
| `i18n/en.json` | English translation |
| `js/i18n.js` | Language registry and switcher logic |
| `js/admin.js` | Admin panel logic — uses `I18n.t()` for all strings |
| `js/main.js` | User-facing logic |