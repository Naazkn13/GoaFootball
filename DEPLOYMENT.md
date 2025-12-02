# Deployment Guide - Football Auth Website

## 📦 Build Structure

Professional build structure for website deployment with support for multiple environments.

## 🔧 Environment Configuration

### Available Environments
- **DEV** - Development
- **SIT** - System Integration Testing
- **UAT** - User Acceptance Testing  
- **PROD** - Production

Each environment has its own configuration files:
- `config/config_[env].json` - Frontend configuration
- `config/config_[env]_api.json` - API/Backend configuration

## 🚀 Building for Deployment

### Build Scripts

Make scripts executable (already done):
```bash
chmod +x build-*.sh
```

### Build Commands

**Development Build:**
```bash
./build-dev.sh
```
Output: `build/football_auth_app_dev.zip`

**SIT Build:**
```bash
./build-sit.sh
```
Output: `build/football_auth_app_sit.zip`

**UAT Build:**
```bash
./build-uat.sh
```
Output: `build/football_auth_app_uat.zip`

**Production Build:**
```bash
./build-prod.sh
```
Output: `build/football_auth_app_prod.zip`

## 📋 What Each Build Script Does

1. **Switches Configuration** - Swaps config files for target environment
2. **Cleans Build Directory** - Removes old build artifacts
3. **Builds Next.js App** - Compiles the application
4. **Copies Dependencies** - Includes .next folder and node_modules
5. **Creates Zip Archive** - Packages everything for deployment
6. **Restores Original Config** - Reverts config files back

## 📁 Build Output Structure

```
build/
└── football_auth_app/
    ├── .next/                 # Next.js build output
    ├── node_modules/          # Dependencies
    ├── config/
    │   ├── config.json
    │   └── config_api.json
    ├── public/                # Static assets
    ├── styles/                # Stylesheets
    ├── server.js              # Express server
    ├── next.config.js         # Next.js config
    └── package.json           # Dependencies list
```

## 🖥️ Server Deployment

### Prerequisites
- Node.js 18+ installed
- Nginx or Apache for reverse proxy

### Deployment Steps

1. **Extract the zip file:**
```bash
unzip football_auth_app_[env].zip
cd football_auth_app
```

2. **Install dependencies (if not included):**
```bash
npm install --production
```

3. **Start the server:**

```bash
NODE_ENV=production node server.js
```

Or use a process manager like systemd.

## 🏥 Health Check Endpoints

The server includes health check endpoints:

- **Health Check:** `GET /healthcheck`
  - Returns server status and disk space
  
- **Disk Check:** `GET /diskcheck`
  - Returns detailed disk space information

## 🔄 Update/Rollback Process

### Update:
```bash
# Stop the server
# Extract new version
cd /path/to/app
unzip -o football_auth_app_[env].zip
# Restart the server
NODE_ENV=production node server.js
```

### Rollback:
```bash
# Stop the server
cd /path/to/app
# Restore from backup
cp -r backup/* .
# Restart the server
NODE_ENV=production node server.js
```

## 🛡️ Security Checklist

- [ ] Update API URLs in config files
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CSP headers (in server.js)
- [ ] Regular security updates
- [ ] Implement logging and monitoring

## 📝 Server Configuration

### API Proxy Configuration

Edit `config/config_api.json` to configure backend API endpoints:

```json
{
  "port": 8080,
  "diskPath": "/var/www/html",
  "proxyUrl": {
    "auth": "https://api.yourdomain.com",
    "user": "https://api.yourdomain.com",
    "payment": "https://api.yourdomain.com"
  }
}
```

### Supported Proxy Routes
- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User management endpoints
- `/api/payment/*` - Payment endpoints

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
./build-prod.sh
```

### Server Won't Start
```bash
# Check port availability
lsof -i :8080

# Check disk space
df -h
```

### API Proxy Issues
- Verify backend API is accessible
- Check `config_api.json` proxy URLs
- Inspect server logs for errors
- Test health check endpoint

## 📞 Support

For deployment issues:
1. Check server logs
2. Verify config files
3. Test health check endpoints
4. Check server resources (CPU, RAM, Disk)

## 🎯 Next Steps After Deployment

1. Configure domain and SSL certificate
2. Set up monitoring solution
3. Configure backup strategy
4. Set up error tracking
5. Configure log management

---

**Note:** Always test in lower environments (DEV/SIT/UAT) before deploying to production!
