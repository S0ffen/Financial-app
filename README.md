# CashNeko

CashNeko is a personal finance tracker built with Next.js App Router, Prisma, PostgreSQL, and Better Auth.

The app focuses on three core areas:

- tracking expenses
- tracking income
- importing bank transactions from ING CSV exports

It includes authentication, an admin panel, a dashboard with charts, month/year filtering, bulk actions for expenses, and CSV import with preview/review before saving.

## Features

### Authentication

- Sign in with `username + password`
- Sign up with `name + username + email + password`
- Session-based protected routes with Better Auth
- Optional admin account bootstrapped from `.env`
- Admin panel for resetting user passwords

### Dashboard

- Monthly dashboard view
- Income vs previous month comparison
- Expense breakdown by category
- Summary cards for income, expenses, and savings
- Month and year filtering

### Expenses

- Create, edit, and delete expenses
- Bulk delete selected expenses
- Category and month filtering
- CSV import entry point from the expenses page

### Income

- Create, edit, and delete income records
- Monthly income list and totals
- Description support for income records

### CSV Import

- ING CSV import with preview before commit
- Imports expenses and salary-like income rows
- Duplicate detection using import hashes
- Rule-based expense categorization
- Review flow for rows that need manual fixes
- Ability to drop unwanted rows before import
- Learns from previously categorized expenses for better future suggestions
- Ignores internal transfers such as `przelew wlasny`

### UI / UX

- App Router layout with sidebar on desktop and drawer on mobile
- shadcn/ui components
- Recharts-based dashboard visualizations
- react-hot-toast notifications
- PWA manifest and app icons

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Better Auth
- Tailwind CSS 4
- shadcn/ui
- Recharts
- react-hot-toast

## Project Structure

```text
app/
  api/                    # Route handlers
  dashboard/              # Authenticated app area
    admin/                # Admin panel
    expenses/             # CSV import screen
    expensesTable/        # Expenses list and bulk actions
    income/               # Income list and forms
  login/                  # Sign in / sign up
  src/lib/                # Auth, Prisma, session helpers
lib/
  constants/              # Shared categories, metadata, import rules
  import/                 # CSV parsing and normalization
prisma/
  migrations/             # Database migrations
  schema.prisma           # Prisma schema
public/
  favicon/                # App icons / favicon assets
```

## Prerequisites

Before you run the project locally, you need:

- Node.js 20+
- npm
- PostgreSQL database

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

Required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=financial"
BETTER_AUTH_SECRET="your-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

Optional variables:

```env
# Optional admin bootstrap
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="StrongPassword123!"
ADMIN_USERNAME="admin"
ADMIN_NAME="System Admin"
```

### What each variable does

- `DATABASE_URL`
  - PostgreSQL connection string used by Prisma
- `BETTER_AUTH_SECRET`
  - secret used by Better Auth to sign and verify sessions/tokens
  - keep it stable between deploys
- `BETTER_AUTH_URL`
  - base URL of the app used by Better Auth
  - local example: `http://localhost:3000`
  - production example: `https://finance.yourdomain.com`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_NAME`
  - if provided, the app will create this user if missing and enforce admin role, username and display name on startup

## Database Setup

Run Prisma migrations and generate the Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

For production:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Running the App

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The root route redirects to `/login`.

## Authentication Flow

Current auth flow in the app:

- sign in: `username + password`
- sign up: `name + username + email + password`

`email` is still stored in the database, but it is not the primary login identifier in the current UI.

## Default App Routes

Main routes in the current app:

- `/login` - sign in / sign up
- `/dashboard` - dashboard with charts and summaries
- `/dashboard/expensesTable` - expenses list
- `/dashboard/expenses/import` - CSV import preview / review
- `/dashboard/income` - income records
- `/dashboard/admin` - admin panel (admin only)

## Admin Bootstrap

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the app bootstraps an admin account automatically.

Behavior:

- if the user does not exist, the app creates it
- on every app start, the admin account is updated to use `ADMIN_NAME`
- on every app start, the admin account is updated to use `ADMIN_USERNAME`
- on every app start, the admin account is enforced as `role=admin`
- the admin account is marked as `emailVerified=true`

This happens on app startup in the auth setup.

## CSV Import Notes

The project includes a sample ING CSV file in the repository root.

Current CSV import behavior:

- supports ING semicolon-separated exports
- detects the actual transaction header row
- decodes Polish bank exports correctly
- imports only relevant rows
- skips duplicates
- skips internal transfers like `przelew w?asny`
- imports:
  - expenses into `Expense`
  - salary-like income rows into `SalaryRecord`

The import flow is:

1. upload CSV
2. generate preview
3. review only rows that need attention
4. edit category / description / date if needed
5. drop rows you do not want to save
6. commit import

## Expense Categories

Current categories used by the app:

- Food
- Shopping
- Recurring
- Health
- Transport
- Entertainment
- Investment
- Occasional
- Uncategorized

## Development Notes

Useful commands:

```bash
npm run dev
npm run build
npm run start
npx prisma migrate dev
npx prisma generate
npx tsc --noEmit
```

## Deployment Notes

Recommended deployment target: Vercel.

Important production requirements:

- set a stable `BETTER_AUTH_URL`
- use one canonical domain for auth
- set all environment variables in the hosting platform
- run Prisma migrations against the production database

Example production `BETTER_AUTH_URL`:

```env
BETTER_AUTH_URL="https://finance.yourdomain.com"
```

Using a dedicated subdomain is recommended if your main domain already hosts something else.

## Current Status

This project already includes:

- authentication
- admin password reset
- dashboard charts
- expense CRUD
- income CRUD
- CSV import preview + commit
- bulk expense deletion
- PWA manifest / icons

## License

This project is currently private and intended for personal use / learning.
