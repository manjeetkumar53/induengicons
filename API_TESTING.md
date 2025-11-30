# Phase 1 Reports API - Quick Test Guide

## Test Endpoints Locally

Start your dev server:
```bash
npm run dev
```

### 1. Profit & Loss Report
```bash
curl "http://localhost:3000/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31" | jq
```

### 2. Cash Flow Report
```bash
curl "http://localhost:3000/api/reports/cash-flow?startDate=2024-01-01&endDate=2024-12-31" | jq
```

### 3. Income Source Report
```bash
curl "http://localhost:3000/api/reports/income-source?startDate=2024-01-01&endDate=2024-12-31" | jq
```

### 4. Expense Category Report
```bash
curl "http://localhost:3000/api/reports/expense-category?startDate=2024-01-01&endDate=2024-12-31" | jq
```

### 5. Transaction Summary (Today)
```bash
curl "http://localhost:3000/api/reports/transaction-summary" | jq
```

## Test with POST (More Options)

```bash
curl -X POST http://localhost:3000/api/reports/profit-loss \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "groupBy": "month",
    "projectId": "optional_project_id"
  }' | jq
```

## Expected Response Format

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 100000,
      "totalExpense": 75000,
      "netProfit": 25000,
      "profitMargin": 25
    },
    "breakdown": [...],
    "incomeByCategory": [...],
    "expenseByCategory": [...]
  },
  "metadata": {
    "filters": {...},
    "generatedAt": "2024-11-29T...",
    "recordCount": 12,
    "cached": false,
    "latency": 234
  }
}
```

## Verify Caching

Run the same query twice - second request should:
- Have `"cached": true`
- Be much faster (< 50ms)

## Test Cron Job (Manual Trigger)

```bash
curl http://localhost:3000/api/cron/precompute \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from `.env.local`
