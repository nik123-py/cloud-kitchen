<div align="center">

# 🍽️ Soni Kitchen

### *Cloud Kitchen Ordering Platform — From Jaiswal & Family*

A full-stack cloud kitchen web app with real-time menu management, WhatsApp-based ordering, UPI payment support, and a built-in admin panel — built to run with zero backend setup.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nik123-py/cloud-kitchen)
![Built with Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Features

### 👤 For Customers
- 🍛 **Browse full menu** by category — no login required
- ⭐ **Today's Special** — featured dish highlighted every day
- 🛒 **Live cart** with real-time quantity & total updates
- 📍 **Delivery address** entry at checkout
- 📱 **Order via WhatsApp** — pre-filled message with all items, totals & address
- 💳 **UPI / QR Code payment** — scan and pay, then confirm on WhatsApp
- 🟢 **Open / Closed status** — dynamically shown based on kitchen hours (IST)

### 🛡️ For Admin (Owner)
- 🔐 **Password-protected admin panel** — local auth, no Google sign-in needed
- 📋 **Full Menu CRUD** — add, edit, delete items; toggle availability
- ✨ **Daily Special** — set a featured dish each day (from menu or custom)
- 📊 **Visitor Analytics** — daily & total visitor bar chart (last 7 days)
- ⚙️ **Settings panel** — configure WhatsApp number, UPI ID, QR code image, timings, kitchen name & address

---

## 🖼️ Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, open/closed status, today's special |
| `/menu` | Full menu with category filters & sticky cart bar |
| `/cart` | Cart review with bill breakdown |
| `/checkout` | Address entry, payment method, QR code, WhatsApp order |
| `/admin` | Password-protected owner panel |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS, ShadCN UI, Framer Motion |
| State | React Context (Cart, Admin), localStorage |
| Backend | Vercel Serverless Functions (`/api`) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Deployment | Vercel (frontend + API together) |

---

## 🚀 Local Development

### 1. Clone & Install

```bash
git clone https://github.com/nik123-py/cloud-kitchen.git
cd cloud-kitchen
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see [Environment Variables](#-environment-variables) below).

### 3. Start dev server

```bash
npm run dev
# App runs at http://localhost:8080
```

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import `nik123-py/cloud-kitchen`
3. Add all environment variables in **Vercel → Settings → Environment Variables**
4. Click **Deploy** — done in ~60 seconds ✅

---

## 🔑 Environment Variables

Copy `.env.example` → `.env` and fill in:

### Frontend (`VITE_` prefix — bundled into build)

| Variable | Description |
|----------|-------------|
| `VITE_ADMIN_USERNAME` | Admin panel login username |
| `VITE_ADMIN_PASSWORD` | Admin panel login password |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number for orders (e.g. `919876543210`) |

### Backend (Vercel serverless functions only)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Secret — bypasses RLS, never expose in frontend |

> **Never commit `.env`** — it is listed in `.gitignore`.

---

## 📱 How Ordering Works

```
Customer browses menu
        ↓
Adds items to cart
        ↓
Goes to Checkout →  enters name, phone, delivery address (optional)
        ↓
Chooses payment:  Cash on delivery  OR  UPI / QR scan
        ↓
Clicks "Order via WhatsApp"
        ↓
WhatsApp opens with pre-filled message:
  🍽️ Order Items  |  💰 Total  |  📍 Address  |  💳 Payment method
        ↓
Admin receives message on WhatsApp → confirms order
```

---

## 🔐 Admin Panel

Access at `/admin` — login with credentials set in your `.env`.

| Tab | What You Can Do |
|-----|----------------|
| **Dashboard** | View visitor count (today + total + 7-day chart), kitchen status, today's special |
| **Menu** | Add / Edit / Delete items, toggle availability, mark bestsellers |
| **Daily Special** | Set today's featured dish (pick from menu or type custom) |
| **Settings** | Kitchen name, address, timings, WhatsApp number, UPI ID, QR code URL |

---

## 📦 Build Output

| Chunk | Gzip Size |
|-------|-----------|
| `vendor-react` (React + Router) | ~53 KB |
| `vendor-ui` (Framer Motion + Radix) | ~63 KB |
| `vendor-supabase` | ~51 KB |
| `vendor-query` (TanStack Query) | ~8 KB |
| `index` (app code) | ~28 KB |
| **Total** | **~200 KB** |

---

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── _lib/               # Shared: supabase client, CORS, auth
│   ├── menu/               # GET /api/menu, POST /api/menu/create
│   └── orders/             # Order management endpoints
├── src/
│   ├── components/         # Header, MenuItemCard, WhatsAppButton
│   ├── context/            # CartContext, AdminContext (localStorage)
│   ├── hooks/              # use-kitchen-status, use-admin
│   ├── pages/              # Index, Menu, Cart, Checkout, Admin
│   └── assets/             # Food images
├── supabase/migrations/    # DB schema
├── .env.example            # Environment variable template
└── vercel.json             # Vercel deployment config
```

---

## 📄 License

Private project — Soni Kitchen, Jaiswal & Family.
