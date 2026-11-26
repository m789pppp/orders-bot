# Orders Bot

WhatsApp AI order-intake assistant + private orders dashboard.

- `supabase/schema.sql` — run once in Supabase SQL Editor
- `lib/config.ts` — business products, questions and the fixed thank-you messages
- `.env.example` — every setting the app needs (set them in Vercel)
- `/api/health` — shows which settings are missing
- `/api/webhook` — Meta WhatsApp webhook URL
- `/dashboard` — admin dashboard (login required)
