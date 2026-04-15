# Books & Finance API

A personal finance and books management REST API built with **Node.js**, **Express**, and **SQLite** (`better-sqlite3`).

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8+

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
copy .env.example .env
# Edit .env if needed (defaults work out of the box)

# 3. Start development server
npm run dev
```

The server starts at `http://localhost:8000`.

---

## Environment Variables (`.env`)

| Variable    | Default                      | Description              |
|-------------|------------------------------|--------------------------|
| `PORT`      | `8000`                       | Server port              |
| `JWT_SECRET`| `books_finance_dev_secret`   | JWT signing secret       |
| `NODE_ENV`  | `development`                | Environment mode         |
| `DB_PATH`   | `./db/books_finance.db`      | SQLite database path     |

---

## Default Credentials

A seed user is created automatically on first run:

| Field    | Value        |
|----------|--------------|
| Username | `BTC007`     |
| Password | `password123`|

---

## Getting a Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "BTC007", "password": "password123"}'
```

Use the returned `token` as a `Bearer` token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <your_token_here>
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Health

| Method | Endpoint   | Auth | Description        |
|--------|------------|------|--------------------|
| GET    | `/health`  | No   | Server health check|

---

### Auth

| Method | Endpoint             | Auth | Description               |
|--------|----------------------|------|---------------------------|
| POST   | `/auth/register`     | No   | Register new user         |
| POST   | `/auth/login`        | No   | Login, receive JWT token  |

---

### Profile

| Method | Endpoint                    | Auth | Description                     |
|--------|-----------------------------|------|---------------------------------|
| GET    | `/profile`                  | Yes  | Get current user (no hash)      |
| PATCH  | `/profile`                  | Yes  | Update username or email        |
| PATCH  | `/profile/change-password`  | Yes  | Change password                 |

---

### Home / Dashboard

| Method | Endpoint       | Auth | Description            |
|--------|----------------|------|------------------------|
| GET    | `/home`        | Yes  | Financial summary      |

---

### Accounts

| Method | Endpoint         | Auth | Description            |
|--------|------------------|------|------------------------|
| GET    | `/accounts`      | Yes  | List accounts          |
| POST   | `/accounts`      | Yes  | Create account         |
| GET    | `/accounts/:id`  | Yes  | Get account            |
| PATCH  | `/accounts/:id`  | Yes  | Update account         |
| DELETE | `/accounts/:id`  | Yes  | Delete account         |

---

### Transactions

| Method | Endpoint              | Auth | Description            |
|--------|-----------------------|------|------------------------|
| GET    | `/transactions`       | Yes  | List transactions      |
| POST   | `/transactions`       | Yes  | Create transaction     |
| GET    | `/transactions/:id`   | Yes  | Get transaction        |
| PATCH  | `/transactions/:id`   | Yes  | Update transaction     |
| DELETE | `/transactions/:id`   | Yes  | Delete transaction     |

---

### Income

| Method | Endpoint         | Auth | Description       |
|--------|------------------|------|-------------------|
| GET    | `/income`        | Yes  | List income       |
| POST   | `/income`        | Yes  | Create income     |
| GET    | `/income/:id`    | Yes  | Get income        |
| PATCH  | `/income/:id`    | Yes  | Update income     |
| DELETE | `/income/:id`    | Yes  | Delete income     |

---

### Expenses

| Method | Endpoint          | Auth | Description       |
|--------|-------------------|------|-------------------|
| GET    | `/expenses`       | Yes  | List expenses     |
| POST   | `/expenses`       | Yes  | Create expense    |
| GET    | `/expenses/:id`   | Yes  | Get expense       |
| PATCH  | `/expenses/:id`   | Yes  | Update expense    |
| DELETE | `/expenses/:id`   | Yes  | Delete expense    |

---

### Budgets

| Method | Endpoint          | Auth | Description       |
|--------|-------------------|------|-------------------|
| GET    | `/budgets`        | Yes  | List budgets      |
| POST   | `/budgets`        | Yes  | Create budget     |
| GET    | `/budgets/:id`    | Yes  | Get budget        |
| PATCH  | `/budgets/:id`    | Yes  | Update budget     |
| DELETE | `/budgets/:id`    | Yes  | Delete budget     |

---

### Savings

| Method | Endpoint          | Auth | Description       |
|--------|-------------------|------|-------------------|
| GET    | `/savings`        | Yes  | List savings      |
| POST   | `/savings`        | Yes  | Create saving     |
| GET    | `/savings/:id`    | Yes  | Get saving        |
| PATCH  | `/savings/:id`    | Yes  | Update saving     |
| DELETE | `/savings/:id`    | Yes  | Delete saving     |

---

### Investments

| Method | Endpoint               | Auth | Description         |
|--------|------------------------|------|---------------------|
| GET    | `/investments`         | Yes  | List investments    |
| POST   | `/investments`         | Yes  | Create investment   |
| GET    | `/investments/:id`     | Yes  | Get investment      |
| PATCH  | `/investments/:id`     | Yes  | Update investment   |
| DELETE | `/investments/:id`     | Yes  | Delete investment   |

---

### Debts

| Method | Endpoint        | Auth | Description    |
|--------|-----------------|------|----------------|
| GET    | `/debts`        | Yes  | List debts     |
| POST   | `/debts`        | Yes  | Create debt    |
| GET    | `/debts/:id`    | Yes  | Get debt       |
| PATCH  | `/debts/:id`    | Yes  | Update debt    |
| DELETE | `/debts/:id`    | Yes  | Delete debt    |

---

### Planned Payments

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | `/planned-payments`         | Yes  | List planned payments    |
| POST   | `/planned-payments`         | Yes  | Create planned payment   |
| GET    | `/planned-payments/:id`     | Yes  | Get planned payment      |
| PATCH  | `/planned-payments/:id`     | Yes  | Update planned payment   |
| DELETE | `/planned-payments/:id`     | Yes  | Delete planned payment   |

---

### Stock (Books Module)

| Method | Endpoint                       | Auth | Description                         |
|--------|--------------------------------|------|-------------------------------------|
| GET    | `/stock`                       | Yes  | List stock items                    |
| POST   | `/stock`                       | Yes  | Create stock item                   |
| GET    | `/stock/:id`                   | Yes  | Get stock item                      |
| PATCH  | `/stock/:id`                   | Yes  | Update stock item                   |
| DELETE | `/stock/:id`                   | Yes  | Delete stock item                   |
| PATCH  | `/stock/:id/adjust-quantity`   | Yes  | Adjust quantity by delta            |

---

### Financial Plans

| Method | Endpoint                                        | Auth | Description                              |
|--------|-------------------------------------------------|------|------------------------------------------|
| GET    | `/financial-plan`                               | Yes  | List financial plans                     |
| POST   | `/financial-plan`                               | Yes  | Create financial plan                    |
| GET    | `/financial-plan/:id`                           | Yes  | Get plan with sub-item counts            |
| PATCH  | `/financial-plan/:id`                           | Yes  | Update plan                              |
| DELETE | `/financial-plan/:id`                           | Yes  | Delete plan + all sub-items (cascade)    |
| GET    | `/financial-plan/calendar`                      | Yes  | Aggregated upcoming financial events     |
| GET    | `/financial-plan/:planId/budgets`               | Yes  | List plan budgets                        |
| POST   | `/financial-plan/:planId/budgets`               | Yes  | Add plan budget                          |
| GET    | `/financial-plan/:planId/budgets/:id`           | Yes  | Get plan budget                          |
| PATCH  | `/financial-plan/:planId/budgets/:id`           | Yes  | Update plan budget                       |
| DELETE | `/financial-plan/:planId/budgets/:id`           | Yes  | Delete plan budget                       |
| GET    | `/financial-plan/:planId/income`                | Yes  | List plan income                         |
| POST   | `/financial-plan/:planId/income`                | Yes  | Add plan income                          |
| GET    | `/financial-plan/:planId/income/:id`            | Yes  | Get plan income                          |
| PATCH  | `/financial-plan/:planId/income/:id`            | Yes  | Update plan income                       |
| DELETE | `/financial-plan/:planId/income/:id`            | Yes  | Delete plan income                       |
| GET    | `/financial-plan/:planId/expenses`              | Yes  | List plan expenses                       |
| POST   | `/financial-plan/:planId/expenses`              | Yes  | Add plan expense                         |
| GET    | `/financial-plan/:planId/expenses/:id`          | Yes  | Get plan expense                         |
| PATCH  | `/financial-plan/:planId/expenses/:id`          | Yes  | Update plan expense                      |
| DELETE | `/financial-plan/:planId/expenses/:id`          | Yes  | Delete plan expense                      |
| GET    | `/financial-plan/:planId/goals`                 | Yes  | List plan goals                          |
| POST   | `/financial-plan/:planId/goals`                 | Yes  | Add plan goal                            |
| GET    | `/financial-plan/:planId/goals/:id`             | Yes  | Get plan goal                            |
| PATCH  | `/financial-plan/:planId/goals/:id`             | Yes  | Update plan goal                         |
| DELETE | `/financial-plan/:planId/goals/:id`             | Yes  | Delete plan goal                         |
| GET    | `/financial-plan/:planId/reminders`             | Yes  | List plan reminders                      |
| POST   | `/financial-plan/:planId/reminders`             | Yes  | Add plan reminder                        |
| GET    | `/financial-plan/:planId/reminders/:id`         | Yes  | Get plan reminder                        |
| PATCH  | `/financial-plan/:planId/reminders/:id`         | Yes  | Update plan reminder                     |
| DELETE | `/financial-plan/:planId/reminders/:id`         | Yes  | Delete plan reminder                     |
| GET    | `/financial-plan/:planId/analysis`              | Yes  | Aggregated income/budget/expense totals  |

---

### People (Personal Contacts / Records)

| Method | Endpoint                                    | Auth | Description                       |
|--------|---------------------------------------------|------|-----------------------------------|
| GET    | `/people`                                   | Yes  | List people                       |
| POST   | `/people`                                   | Yes  | Create person                     |
| GET    | `/people/:id`                               | Yes  | Get person                        |
| PATCH  | `/people/:id`                               | Yes  | Update person                     |
| DELETE | `/people/:id`                               | Yes  | Delete person + all nested data   |
| GET    | `/people/:personId/transactions`            | Yes  | List person transactions          |
| POST   | `/people/:personId/transactions`            | Yes  | Add person transaction            |
| GET    | `/people/:personId/transactions/:id`        | Yes  | Get person transaction            |
| PATCH  | `/people/:personId/transactions/:id`        | Yes  | Update person transaction         |
| DELETE | `/people/:personId/transactions/:id`        | Yes  | Delete person transaction         |
| GET    | `/people/:personId/reminders`               | Yes  | List person reminders             |
| POST   | `/people/:personId/reminders`               | Yes  | Add person reminder               |
| GET    | `/people/:personId/reminders/:id`           | Yes  | Get person reminder               |
| PATCH  | `/people/:personId/reminders/:id`           | Yes  | Update person reminder            |
| DELETE | `/people/:personId/reminders/:id`           | Yes  | Delete person reminder            |
| GET    | `/people/:personId/records`                 | Yes  | List person records               |
| POST   | `/people/:personId/records`                 | Yes  | Add person record                 |
| GET    | `/people/:personId/records/:id`             | Yes  | Get person record                 |
| PATCH  | `/people/:personId/records/:id`             | Yes  | Update person record              |
| DELETE | `/people/:personId/records/:id`             | Yes  | Delete person record              |

---

### Contacts

| Method | Endpoint           | Auth | Description       |
|--------|--------------------|------|-------------------|
| GET    | `/contacts`        | Yes  | List contacts     |
| POST   | `/contacts`        | Yes  | Create contact    |
| GET    | `/contacts/:id`    | Yes  | Get contact       |
| PATCH  | `/contacts/:id`    | Yes  | Update contact    |
| DELETE | `/contacts/:id`    | Yes  | Delete contact    |

---

### Segregation

| Method | Endpoint               | Auth | Description                                         |
|--------|------------------------|------|-----------------------------------------------------|
| GET    | `/segregation`         | Yes  | List segregation rules                              |
| POST   | `/segregation`         | Yes  | Create rule with allocations (must sum to 100%)     |
| GET    | `/segregation/:id`     | Yes  | Get rule with allocations                           |
| PATCH  | `/segregation/:id`     | Yes  | Update rule; replaces allocations if provided       |
| DELETE | `/segregation/:id`     | Yes  | Delete rule + all allocations                       |

---

### Split Expenses

| Method | Endpoint                                        | Auth | Description                                |
|--------|-------------------------------------------------|------|--------------------------------------------|
| GET    | `/split-expense`                                | Yes  | List split expenses                        |
| POST   | `/split-expense`                                | Yes  | Create split + participants (sum validated)|
| GET    | `/split-expense/:id`                            | Yes  | Get split with participants                |
| PATCH  | `/split-expense/:id`                            | Yes  | Update split header                        |
| DELETE | `/split-expense/:id`                            | Yes  | Delete split + all participants            |
| GET    | `/split-expense/:id/participants`               | Yes  | List participants                          |
| POST   | `/split-expense/:id/participants`               | Yes  | Add participant                            |
| PATCH  | `/split-expense/:id/participants/:pid/settle`   | Yes  | Mark participant as settled                |
| DELETE | `/split-expense/:id/participants/:pid`          | Yes  | Remove participant                         |

---

### Public Feed

| Method | Endpoint             | Auth     | Description                         |
|--------|----------------------|----------|-------------------------------------|
| GET    | `/public`            | No       | Paginated public posts feed         |
| POST   | `/public`            | Yes      | Create a post (max 500 chars)       |
| PATCH  | `/public/:id/like`   | No       | Increment likes by 1               |
| DELETE | `/public/:id`        | Yes      | Delete own post                     |

---

## Common Query Parameters

All list endpoints support:

| Param    | Default      | Description                               |
|----------|--------------|-------------------------------------------|
| `page`   | `1`          | Page number                               |
| `limit`  | `20`         | Items per page                            |
| `sort`   | `created_at` | Sort field                                |
| `order`  | `desc`       | Sort direction (`asc` or `desc`)          |
| `search` | —            | Search string (filtered per module)       |
| `from`   | —            | Start date filter (ISO date string)       |
| `to`     | —            | End date filter (ISO date string)         |

---

## Project Structure

```
backend/
├── db/
│   ├── connection.js       # SQLite singleton
│   ├── migrations.js       # Schema creation (26 tables)
│   └── seed.js             # Default user seed
├── middleware/
│   ├── auth.js             # JWT verification
│   └── errorHandler.js     # Global error handler
├── routes/
│   ├── auth.js
│   ├── accounts.js
│   ├── transactions.js
│   ├── income.js
│   ├── expenses.js
│   ├── budgets.js
│   ├── savings.js
│   ├── investments.js
│   ├── debts.js
│   ├── plannedPayments.js
│   ├── home.js
│   ├── stock.js
│   ├── financialPlan.js
│   ├── planBudget.js
│   ├── planIncome.js
│   ├── planExpense.js
│   ├── planGoals.js
│   ├── planReminders.js
│   ├── planAnalysis.js
│   ├── financialCalendar.js
│   ├── people.js
│   ├── peopleTransactions.js
│   ├── peopleReminders.js
│   ├── peopleRecords.js
│   ├── contacts.js
│   ├── segregation.js
│   ├── splitExpense.js
│   ├── profile.js
│   └── public.js
├── utils/
│   ├── response.js         # sendSuccess / sendError helpers
│   └── pagination.js       # Paginated query helper
├── app.js                  # Express app + route mounting
├── index.js                # Server entry point
├── .env                    # Environment config
└── package.json
```
