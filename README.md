# Handy Pantry

A collaborative household pantry tracker that helps you avoid food waste, duplicate purchases, and grocery overspending.

## Overview

Handy Pantry is a virtual representation of your home pantry. It lets household members collectively view, add, and track what they have, need, and are running low on — reducing food waste, saving money, and making grocery trips less stressful.

## Tech Stack

- Frontend: Next.js, deployed on Vercel
- Backend: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- AI/OCR: Receipt scanning and recipe suggestions via external APIs
- Architecture: Microservices, event-driven

## Features

**Pantry**
- Toggle inventory status (have, need, out)
- Expiration tracking with push notifications
- Sort and filter by category, expiry date, or usage
- Pantry lifetime history

**Shopping**
- Auto-generated shopping list from low or expired items
- Spending tracker and monthly budget management
- Price comparison across stores
- Shopping trends and analytics

**AI Tools**
- Receipt scanning — scan a grocery receipt to auto-populate pantry items
- Recipe suggestions based on current inventory and dietary restrictions
- Voice input for hands-free item entry

**Household**
- Shared pantry across multiple household accounts
- Real-time sync across devices
- Personalization quiz on first launch

## Database

PostgreSQL via Supabase. Authentication is handled by Supabase's own `auth.users`;
application data lives in the `public` schema:

| Group | Tables |
| --- | --- |
| Accounts | `profiles` |
| Pantry | `pantry_items` |
| Shopping | `shopping_lists`, `shopping_list_items` |
| Receipts | `receipts`, `receipt_items` |
| Recipes | `recipes` |
| Pricing | `stores`, `product_prices`, `price_comparisons` |
| Analytics | `spending_analytics` |

Schema and seed data are versioned in [`scripts/`](scripts/), applied in filename order.

## Getting Started

```bash
git clone https://github.com/KeRon-asm/handy_pantry
cd handy_pantry
pnpm install
pnpm dev
```

Configure your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Repository

https://github.com/KeRon-asm/handy_pantry
