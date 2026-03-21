# Mssk_Talk

An anonymous message board deployed on Cloudflare Pages, with Supabase as the database backend.

Clean and minimal by design — form-first, with dark mode and bilingual (Chinese/English) support.

[中文](./README.zh.md)

## Features

**User-facing**
- Send anonymous messages (optional image URL and contact info)
- Card profile (optional nickname, avatar, bio — auto-saved locally)
- View message history and admin replies
- Pinned messages section (shown when enabled by admin)
- Floating message wall (bubble animation in the background, enabled by admin)
- Chinese / English language toggle
- Light / dark theme toggle

**Admin panel** (`/admin`)
- View all messages grouped by visitor, collapsible
- Paginated browsing with direct page-jump input
- Search messages with keyword highlighting
- Filter: All / Unread only / Blocked / Word-filtered
- Mark as read, manually block/unblock messages
- Add notes to visitors, block/unblock visitors
- View visitor card (nickname, avatar, bio)
- Reply to messages (edit/delete replies, optional email notification to user)
- Feature messages (add to floating wall), with a dedicated featured management panel
- Pin messages
- Export CSV with scope and filter options
- System settings (site title/description, toggles and numeric values, live reload)
- Blocked word management (auto-intercepts matching messages silently; admin can release or delete)
- Visitor statistics (total count, today's new visitors, 7-day message volume bar chart)
- Warm / cool color scheme toggle

**Anti-spam**
- Honeypot hidden field
- IP rate limiting (max 3 per minute)
- Minimum send interval (10 seconds)
- Daily message limit per visitor (configurable)
- Blocked word auto-interception (silent, user unaware; admin can review and release)

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/7f511a07-f190-45ef-8d89-370401169ea0" width="100%">
    </td>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/2fa15c05-6e75-4677-b43b-69d36be77372" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/7c6039c3-cbec-4eab-bc72-dbe12f94218f" width="100%">
    </td>
    <td width="50%" align="center">
      <img src="https://github.com/user-attachments/assets/22a16c34-e130-4379-a912-960739037860" width="100%">
    </td>
  </tr>
</table>

## Project Structure

```
├── index.html              # User-facing page
├── admin.html              # Admin panel
├── schema.sql              # Database initialization script
├── README.md               # Chinese documentation
├── README.en.md            # English documentation
├── css/
│   ├── main.css            # User-facing styles
│   └── admin.css           # Admin panel styles
├── js/
│   ├── config.js           # Config loader
│   ├── i18n.js             # Internationalization
│   ├── supabase.js         # Database operation wrappers
│   ├── visitor.js          # Visitor UUID management
│   ├── bubbles.js          # Floating message wall animation
│   ├── theme.js            # Theme / color scheme toggle
│   ├── main.js             # User-facing logic
│   └── admin.js            # Admin panel logic
├── i18n/
│   ├── zh.json             # Chinese strings
│   └── en.json             # English strings
└── functions/
    └── api/
        ├── config.js       # Delivers settings, featured and pinned data
        ├── message.js      # Receives messages (anti-spam, blocked word check)
        ├── visitor.js      # Visitor card updates
        └── admin.js        # Admin operation proxy
```

## Deployment

### 1. Supabase

1. Create a new project and run `schema.sql` in the SQL Editor
2. Note down the following:
   - Project URL
   - `anon` public key (publishable key)
   - `service_role` secret key

### 2. Cloudflare Pages

1. Fork this repository and connect it to Cloudflare Pages
2. Build settings: framework preset `None`, build command empty, output directory `/`
3. Add the following **Environment Variables** under Settings:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | anon public key |
| `SUPABASE_SECRET_KEY` | service_role secret key |
| `ADMIN_PASSWORD` | Admin login password |
| `NOTIFY_TG_TOKEN` | (Optional) Telegram Bot Token |
| `NOTIFY_TG_CHAT_ID` | (Optional) Telegram Chat ID |
| `NOTIFY_RESEND_KEY` | (Optional) Resend API Key |
| `NOTIFY_EMAIL_FROM` | (Optional) Sender email (domain must be verified in Resend) |
| `NOTIFY_EMAIL_TO` | (Optional) Recipient email |

4. Once deployed, visit `/admin` and log in with your password

### Notifications (optional)

Both Telegram and email notifications are supported. Configure the corresponding environment variables to enable either or both independently.

Email notifications use [Resend](https://resend.com) (free tier: 3,000 emails/month). Sender domain verification is required.

## Database Tables

| Table | Description |
|-------|-------------|
| `visitors` | Visitor records (UUID, block status, note, card profile) |
| `messages` | Messages (content, image, contact, status flags) |
| `replies` | Admin replies |
| `settings` | Key-value system configuration |
| `blocked_words` | Blocked word list |

## License

MIT