# Build & Deployment Guide

## Environments

This project supports **2 environments**:

1. **Local** - Development environment
2. **SIT** - System Integration Testing environment

---

## Environment Files

### Local Environment
- **File:** `.env.local`
- **Usage:** Development on local machine
- **Start:** `npm run dev`

### SIT Environment
- **File:** `.env.sit`
- **Usage:** SIT deployment
- **Build:** `./build-sit.sh`

**Note:** Both environments use the **same credentials** (Supabase, SMTP, Razorpay)

---

## Local Development

### Start Development Server
```bash
npm run dev
```

Server runs at: http://localhost:3000

### Environment Variables (.env.local)
```env
SUPABASE_URL=https://dohuftotzdgxgzsbxvis.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
JWT_SECRET=a7f8d9e3b2c1a5f6...
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
NEXT_PUBLIC_API_URL=http://localhost:3000
EMAIL_PROVIDER=nodemailer
EMAIL_FROM=kachreomkar8@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=kachreomkar8@gmail.com
SMTP_PASSWORD=oyvwoqnuwvbvawbg
NODE_ENV=development
```

---

## SIT Build & Deployment

### Build for SIT
```bash
./build-sit.sh
```

This will:
1. Load environment variables from `.env.sit`
2. Clean previous builds
3. Build Next.js application
4. Create `build/football_auth_app` directory
5. Copy all necessary files

### Build Output
```
build/
  └── football_auth_app/
      ├── .next/              # Next.js build
      ├── public/             # Static assets
      ├── node_modules/       # Dependencies
      ├── package.json        # Package config
      ├── next.config.js      # Next.js config
      ├── server.js           # Custom server
      └── .env.production     # SIT env vars
```

### Deploy to SIT Server
```bash
# Option 1: Copy entire directory
scp -r build/football_auth_app user@sit-server:/path/to/deploy

# Option 2: Create zip and upload
cd build
zip -r football_auth_app.zip football_auth_app
scp football_auth_app.zip user@sit-server:/path/to/deploy
```

### Start on SIT Server
```bash
cd /path/to/deploy/football_auth_app
npm install --production
npm start
```

---

## Quick Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start local dev | `npm run dev` |
| Build for SIT | `./build-sit.sh` |
| Run production build | `npm start` |
| Create database tables | `node setup-database.js` |

---

## Environment Comparison

| Configuration | Local | SIT |
|--------------|-------|-----|
| Supabase URL | ✅ Same | ✅ Same |
| Supabase Keys | ✅ Same | ✅ Same |
| JWT Secret | ✅ Same | ✅ Same |
| Razorpay Keys | ✅ Same | ✅ Same |
| SMTP Settings | ✅ Same | ✅ Same |
| NODE_ENV | development | sit |
| API URL | localhost:3000 | localhost:3000 |

---

## Notes

- ⚠️ `.env.local` and `.env.sit` are in `.gitignore` (won't be committed)
- ✅ Both environments use same database (Supabase)
- ✅ Both environments use same email service (Gmail SMTP)
- ✅ Both environments use same payment gateway (Razorpay test mode)
- 🔒 Keep credentials secure and never commit to git

---

## Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf .next build node_modules
npm install
./build-sit.sh
```

### Environment variables not loading
```bash
# Check if .env.sit exists
ls -la .env.sit

# Verify file contents
cat .env.sit
```

### Port already in use
```bash
# Kill process on port 3000
pkill -f "next dev"
# or
lsof -ti:3000 | xargs kill -9
```

---

**Last Updated:** November 30, 2025
**Environment Count:** 2 (Local, SIT)
**Credentials:** Shared across environments
