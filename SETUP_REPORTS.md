# Setup Instructions for Reports System

## Prerequisites
1. Upstash Redis account (free tier)
2. Gemini API key (optional for AI features)
3. MongoDB connection

## Step 1: Sign up for Upstash Redis (FREE)

1. Go to https://upstash.com
2. Sign up with GitHub/Google
3. Create a new Redis database
4. Copy the "REST URL" and "REST TOKEN"

## Step 2: Get Gemini API Key (Optional - for future AI features)

1. Go to https://ai.google.dev
2. Get API key
3. Free tier: 60 requests/minute

## Step 3: Add Environment Variables

Create `.env.local` file (copy from `env.template`):

```bash
cp env.template .env.local
```

Edit `.env.local` and add:

```env
# MongoDB (you already have this)
MONGODB_URI=your_existing_mongodb_uri

# Upstash Redis (from Step 1)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxZ

# Gemini AI (optional - for future)
GEMINI_API_KEY=your_gemini_api_key_here

# Cron Secret (generate random string)
CRON_SECRET=$(openssl rand -base64 32)

# JWT Secret (you already have this)
JWT_SECRET=your_existing_jwt_secret
```

## Step 4: Test Locally

```bash
# Start development server
npm run dev

# Test the Profit & Loss API
curl http://localhost:3000/api/reports/profit-loss?startDate=2024-01-01\u0026endDate=2024-12-31
```

## Step 5: Deploy to Vercel

```bash
# Add environment variables to Vercel
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add CRON_SECRET

# Deploy
vercel --prod
```

## What's Next?

Week 1 Complete ✅:
- Redis caching setup
- Report service layer
- First API endpoint (Profit & Loss)

Week 2 (Next):
- Add remaining 4 API endpoints
- Create cron job for pre-computation
- Test all reports

## Troubleshooting

### Redis not working?
- Check if UPSTASH_ env vars are set
- System will work without cache (just slower)

### Build failing?
- Run `npm run build -- --turbopack` to bypass some lints
- Or add `SKIP_ENV_VALIDATION=true`

### Can't connect to MongoDB?
- Verify MONGODB_URI is correct
- Check if IP is whitelisted in Atlas
