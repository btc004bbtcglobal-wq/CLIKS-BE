# API Endpoints Guide

All API endpoints are prefixed with `/api/v1`.

## 1. Core & Auth
- **GET** `/health`
  - *Returns:* System status check.
- **POST** `/auth/register`
  - *Body:* `username`, `email`, `password`
  - *Returns:* Registration details & tokens.
- **POST** `/auth/login`
  - *Body:* `email` or `username`, `password`
  - *Returns:* Issue new Auth & Refresh Token JWTs.
- **POST** `/auth/refresh`
  - *Body:* `refreshToken`
  - *Returns:* New valid Access & Refresh token pair.
- **POST** `/auth/logout`
  - *Body:* `refreshToken`
  - *Returns:* Nullifies DB token record.
- **POST** `/auth/logout-all`
  - *Body:* (none)
  - *Requires:* Valid Bearer Token
  - *Returns:* Nullifies all valid sessions for the authorized user.

## 2. Admin & Access Control (RBAC)
Auth requirement: **Bearer Token** with `admin` role required.
- **GET** `/admin/users` — List all users (paginated)
- **DELETE** `/admin/users/:id` — Delete a user account and associated tokens
- **PATCH** `/admin/users/:id/role` — Change user role (e.g., set to admin)
- **DELETE** `/admin/public/:id` — Delete any public post globally

## 3. Personal & Account Data
Auth requirement: **Bearer Token** required for all endpoints below.
- **GET** `/profile`
- **PATCH** `/profile` — Update username/email
- **PATCH** `/profile/change-password`
- **GET** `/home` — Financial summary dashboard

## 4. Financial Core Modules
Standard CRUD operations exist for all fundamental modules below:
- **`GET`** (List all items, supports pagination query params)
- **`POST`** (Create a new item)
- **`GET /:id`** (Retrieve specific item)
- **`PATCH /:id`** (Update an item)
- **`DELETE /:id`** (Remove an item)

**Modules:**
- `/accounts` (Wallets, Bank Accounts)
- `/transactions` (Master record of transfers)
- `/income` (Categorised earnings)
- `/expenses` (Categorised spending)
- `/budgets` (Spending limitations)
- `/savings` (Target trackers)
- `/investments` (Asset records)
- `/debts` (Liabilities tracking)
- `/planned-payments` (Future bills)

## 5. Financial Plan (Strategic Command Module)
Detailed sub-item management that cascades from a root Financial Plan.
- **`/financial-plans`** — Root CRUD operations
- **`/financial-plans/calendar`** — Aggregated upcoming events (GET only)
- **`/financial-plans/:planId/budgets`** — CRUD for plan-specific budgets
- **`/financial-plans/:planId/income`** — CRUD for plan-specific income
- **`/financial-plans/:planId/expenses`** — CRUD for plan-specific expenses
- **`/financial-plans/:planId/goals`** — CRUD for plan-specific goals
- **`/financial-plans/:planId/reminders`** — CRUD for plan-specific reminders
- **`/financial-plans/:planId/analysis`** — Aggregated plan totals (GET only)

## 6. People & Relationship Management
Allows associating financial transactions, reminders, notes recursively to specific people.
- **`/people`** — Root CRUD operations
- **`/people/:personId/transactions`** — CRUD for person-specific transactions
- **`/people/:personId/reminders`** — CRUD for person-specific reminders
- **`/people/:personId/records`** — CRUD for text records on person

## 7. Shared & External Finance Management
- **`/contacts`** — Standard CRUD operations
- **`/segregation`** — Rule-based tracking of split ratios (Standard CRUD operations)
- **`/split-expenses`** — Group activity sharing tracker (Root CRUD operations)
  - `/split-expenses/:id/participants` — GET (List), POST (Add)
  - `/split-expenses/:id/participants/:pid/settle` — PATCH (Settle participant debt)
  - `/split-expenses/:id/participants/:pid` — DELETE (Remove participant)

## 8. Business & Special Utility
- **`/stock`** — Books/Physical inventory tracker (Standard CRUD operations)
  - *Special:* `/stock/:id/adjust-quantity` — PATCH (Adjust quantity levels logic)

## 9. Social/Public Functionality
- **GET** `/public` — Paginated community feed (No Auth Required)
- **POST** `/public` — Create a feed post (Auth Required)
- **PATCH** `/public/:id/like` — Liking utility (No Auth Required — Rate Limited)
- **DELETE** `/public/:id` — Author-only post deletion (Auth Required)

---

### Common Query Parameters Reference (GET lists)
When retrieving lists across any endpoint (e.g. `/expenses?page=2&limit=50`), you can filter leveraging:
- `page`: (Default: 1)
- `limit`: (Default: 20)
- `sort`: Defines standard sort (Default: `created_at`)
- `order`: (`asc` or `desc`)
- `from` / `to`: ISO date filters
