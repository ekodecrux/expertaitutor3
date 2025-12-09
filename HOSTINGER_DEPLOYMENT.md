# ACES-AIProfessor - Hostinger Deployment Guide

This guide provides step-by-step instructions for deploying the ACES-AIProfessor platform to Hostinger VPS or shared hosting.

---

## Prerequisites

- Hostinger VPS or Business hosting plan with Node.js support
- SSH access to your server
- MySQL database (provided by Hostinger)
- Domain name configured in Hostinger control panel

---

## Deployment Steps

### 1. Server Requirements

Ensure your Hostinger server meets these requirements:

- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0 or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space

### 2. Upload Files

**Option A: Using SSH and Git (Recommended)**

```bash
# SSH into your Hostinger server
ssh your_username@your_server_ip

# Navigate to your web directory
cd ~/public_html

# Clone the repository (if using Git)
git clone <your-repository-url> aces-aiprofessor
cd aces-aiprofessor

# Or upload the deployment package via FTP/SFTP
# Extract the zip file if uploaded manually
```

**Option B: Using Hostinger File Manager**

1. Log in to Hostinger control panel
2. Go to File Manager
3. Navigate to `public_html`
4. Upload the deployment ZIP file
5. Extract the contents

### 3. Install Dependencies

```bash
# Install pnpm if not available
npm install -g pnpm

# Install project dependencies
pnpm install --prod
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
nano .env
```

Update the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-jwt-secret-min-32-characters-long"

# OAuth Configuration (if using Manus OAuth)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
VITE_APP_ID="your-app-id"

# Owner Information
OWNER_OPEN_ID="your-owner-id"
OWNER_NAME="Your Name"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"

# Manus Built-in APIs (if applicable)
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="your-forge-api-key"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-forge-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.yourdomain.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Application Settings
VITE_APP_TITLE="ACES-AIProfessor"
VITE_APP_LOGO="/logo.png"

# Node Environment
NODE_ENV="production"
```

### 5. Database Setup

**Create Database in Hostinger:**

1. Log in to Hostinger control panel
2. Go to Databases → MySQL Databases
3. Create a new database (e.g., `aces_aiprofessor`)
4. Create a database user and assign privileges
5. Note the connection details

**Run Migrations:**

```bash
# Push database schema
pnpm db:push

# Or run migrations manually
cd drizzle
# Execute SQL files in order if needed
```

**Seed Initial Data (Optional):**

```bash
# Seed demo users and data
node seed-users.mjs
```

### 6. Build Application

```bash
# Build the production bundle
NODE_ENV=production pnpm build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/server/` - Backend server files

### 7. Configure Web Server

**For Node.js Hosting:**

Create a `server.js` file in the root:

```javascript
const { createServer } = require('./dist/server/_core/index.js');

const PORT = process.env.PORT || 3000;

createServer().then(app => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

**For Apache/Nginx (Reverse Proxy):**

Create `.htaccess` for Apache:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

Or Nginx configuration:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 8. Start the Application

**Using PM2 (Recommended for production):**

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server/_core/index.ts --name aces-aiprofessor --interpreter tsx

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Using Node directly:**

```bash
NODE_ENV=production node server/_core/index.js
```

**Using Hostinger's Node.js App Manager:**

1. Go to Hostinger control panel
2. Navigate to Advanced → Node.js
3. Create new Node.js application
4. Set entry point to `server/_core/index.js`
5. Set environment variables
6. Start the application

### 9. Configure Stripe Webhooks

1. Log in to Stripe Dashboard
2. Go to Developers → Webhooks
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 10. SSL Certificate

**Using Hostinger's Free SSL:**

1. Go to Hostinger control panel
2. Navigate to SSL → Manage SSL
3. Enable free SSL certificate for your domain
4. Wait for certificate activation (usually instant)

**Or use Let's Encrypt:**

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --webroot -w /path/to/public_html -d yourdomain.com -d www.yourdomain.com
```

### 11. Verify Deployment

1. Visit `https://yourdomain.com`
2. Test login with demo credentials:
   - Email: `student1@acesaiprofessor.com`
   - Password: `demo123`
3. Check all major features:
   - User registration/login
   - Content library
   - Favorites
   - Recommendations
   - Subscription management
   - Admin panel (if admin user)

---

## Post-Deployment

### Monitoring

```bash
# View application logs
pm2 logs aces-aiprofessor

# Monitor application status
pm2 status

# Restart application
pm2 restart aces-aiprofessor
```

### Backup Strategy

1. **Database Backups:**
   ```bash
   # Daily backup script
   mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
   ```

2. **File Backups:**
   - Use Hostinger's automatic backup feature
   - Or setup cron job for manual backups

3. **Environment Variables:**
   - Keep `.env` file backed up securely
   - Never commit to version control

### Performance Optimization

1. **Enable Caching:**
   - Configure Redis if available
   - Use Hostinger's built-in caching

2. **CDN Setup:**
   - Use Cloudflare for static assets
   - Configure in Hostinger DNS settings

3. **Database Optimization:**
   - Add indexes for frequently queried fields
   - Monitor slow queries
   - Regular database maintenance

### Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall rules
- [ ] Configure rate limiting
- [ ] Setup fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Backup `.env` file securely
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Setup security headers

---

## Troubleshooting

### Application won't start

1. Check Node.js version: `node --version`
2. Verify environment variables in `.env`
3. Check database connection
4. Review logs: `pm2 logs`

### Database connection errors

1. Verify `DATABASE_URL` in `.env`
2. Check MySQL service status
3. Confirm database user privileges
4. Test connection manually:
   ```bash
   mysql -u username -p -h localhost database_name
   ```

### Stripe webhooks not working

1. Verify webhook URL is accessible
2. Check `STRIPE_WEBHOOK_SECRET` in `.env`
3. Review Stripe dashboard for failed events
4. Check server logs for webhook errors

### Performance issues

1. Increase server resources (RAM/CPU)
2. Enable caching (Redis)
3. Optimize database queries
4. Use CDN for static assets
5. Monitor with `pm2 monit`

---

## Support

For deployment assistance:
- Hostinger Support: https://www.hostinger.com/support
- Project Documentation: See `README.md`
- Technical Issues: Check `todo.md` for known issues

---

## Updating the Application

```bash
# Pull latest changes (if using Git)
git pull origin main

# Install new dependencies
pnpm install --prod

# Run database migrations
pnpm db:push

# Rebuild application
NODE_ENV=production pnpm build

# Restart server
pm2 restart aces-aiprofessor
```

---

## Rollback Procedure

If deployment fails:

```bash
# Restore previous version
git checkout <previous-commit-hash>

# Reinstall dependencies
pnpm install --prod

# Rebuild
NODE_ENV=production pnpm build

# Restore database backup
mysql -u username -p database_name < backup_YYYYMMDD.sql

# Restart server
pm2 restart aces-aiprofessor
```

---

**Deployment Complete!** 🎉

Your ACES-AIProfessor platform should now be live at `https://yourdomain.com`
