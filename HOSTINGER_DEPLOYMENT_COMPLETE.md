# AI Professor Platform - Complete Hostinger Deployment Guide

## 📦 Deployment Package Contents

This package contains everything needed to deploy the AI Professor platform to Hostinger VPS.

### Package Structure
```
ai-professor-hostinger-deployment/
├── dist/                          # Production build (frontend + backend)
├── drizzle/                       # Database schema and migrations
├── server/                        # Backend source code
├── client/                        # Frontend source code
├── package.json                   # Dependencies
├── pnpm-lock.yaml                # Dependency lock file
├── .env.example                  # Environment variables template
├── ecosystem.config.js           # PM2 process manager configuration
└── HOSTINGER_DEPLOYMENT_COMPLETE.md  # This file
```

## 🚀 Step-by-Step Deployment Instructions

### Prerequisites
- Hostinger VPS with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name pointed to your VPS IP address

---

## Part 1: Server Setup (30 minutes)

### 1.1 Connect to Your Hostinger VPS
```bash
ssh root@your-vps-ip-address
# Or use Hostinger's web-based terminal
```

### 1.2 Update System Packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js 22.x (Required)
```bash
# Install Node.js 22.x using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v22.x.x
npm --version
```

### 1.4 Install pnpm Package Manager
```bash
npm install -g pnpm
pnpm --version  # Should show 9.x or higher
```

### 1.5 Install PM2 Process Manager
```bash
npm install -g pm2
pm2 --version
```

### 1.6 Install MySQL/MariaDB Database
```bash
# Install MySQL Server
apt install -y mysql-server

# Secure MySQL installation
mysql_secure_installation
# Follow prompts:
# - Set root password: Choose a strong password
# - Remove anonymous users: Yes
# - Disallow root login remotely: Yes
# - Remove test database: Yes
# - Reload privilege tables: Yes
```

### 1.7 Create Database and User
```bash
# Login to MySQL
mysql -u root -p

# Run these SQL commands:
CREATE DATABASE ai_professor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_professor_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON ai_professor_db.* TO 'ai_professor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.8 Install Nginx Web Server
```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
systemctl status nginx
```

---

## Part 2: Application Deployment (20 minutes)

### 2.1 Create Application Directory
```bash
mkdir -p /var/www/ai-professor
cd /var/www/ai-professor
```

### 2.2 Upload Deployment Package
**Option A: Using SCP from your local machine**
```bash
# From your local machine (not on VPS)
scp -r ai-professor-hostinger-deployment.tar.gz root@your-vps-ip:/var/www/ai-professor/

# Then on VPS, extract:
cd /var/www/ai-professor
tar -xzf ai-professor-hostinger-deployment.tar.gz
```

**Option B: Using Git (if you have a private repository)**
```bash
cd /var/www/ai-professor
git clone https://your-private-repo-url.git .
```

**Option C: Using Hostinger File Manager**
1. Upload the deployment package via Hostinger's File Manager
2. Extract using the web interface or SSH

### 2.3 Install Dependencies
```bash
cd /var/www/ai-professor
pnpm install --prod
```

### 2.4 Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit with your actual values
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
DATABASE_URL=mysql://ai_professor_user:your_secure_password_here@localhost:3306/ai_professor_db

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string

# Application Configuration
NODE_ENV=production
PORT=3000

# Manus OAuth (if using Manus authentication)
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Owner Information
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Manus Built-in APIs (if using)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# Stripe Payment Gateway (if using)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# Twilio SMS (if using)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Analytics (if using)
VITE_ANALYTICS_ENDPOINT=https://analytics.your-domain.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# Application Branding
VITE_APP_TITLE=AI Professor
VITE_APP_LOGO=/logo.png
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### 2.5 Run Database Migrations
```bash
cd /var/www/ai-professor
pnpm db:push
```

This will create all database tables automatically.

### 2.6 Seed Initial Data (Optional)
```bash
# Seed NEET content (5,200+ questions)
node server/seed-neet-optimized.mjs

# Seed demo users (if needed for testing)
node server/seed-demo-users.mjs
```

---

## Part 3: PM2 Process Management (10 minutes)

### 3.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

**Paste this configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'ai-professor',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/ai-professor/logs/error.log',
    out_file: '/var/www/ai-professor/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

### 3.2 Create Logs Directory
```bash
mkdir -p /var/www/ai-professor/logs
```

### 3.3 Start Application with PM2
```bash
cd /var/www/ai-professor
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs ai-professor --lines 50
```

### 3.4 Configure PM2 Startup Script
```bash
# Generate startup script
pm2 startup systemd

# Copy and run the command that PM2 outputs
# It will look like: sudo env PATH=$PATH:/usr/bin...

# Save current PM2 process list
pm2 save
```

---

## Part 4: Nginx Configuration (15 minutes)

### 4.1 Create Nginx Configuration File
```bash
nano /etc/nginx/sites-available/ai-professor
```

**Paste this configuration (replace `your-domain.com` with your actual domain):**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/ai-professor-access.log;
    error_log /var/log/nginx/ai-professor-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.2 Enable Site Configuration
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/ai-professor /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

---

## Part 5: SSL Certificate with Let's Encrypt (10 minutes)

### 5.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtain SSL Certificate
```bash
# Replace your-domain.com with your actual domain
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 5.3 Test Auto-Renewal
```bash
# Dry run to test renewal
certbot renew --dry-run

# Certbot will automatically renew certificates before expiry
```

---

## Part 6: Firewall Configuration (5 minutes)

### 6.1 Configure UFW Firewall
```bash
# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Part 7: Post-Deployment Verification (10 minutes)

### 7.1 Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs ai-professor --lines 100

# Check if app is listening on port 3000
netstat -tuln | grep 3000
```

### 7.2 Check Nginx Status
```bash
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/ai-professor-access.log
tail -f /var/log/nginx/ai-professor-error.log
```

### 7.3 Test Website
```bash
# Test HTTP redirect
curl -I http://your-domain.com

# Test HTTPS
curl -I https://your-domain.com
```

**Open in browser:**
- https://your-domain.com
- Login with test credentials: `student1@acesaiprofessor.com` / `demo123`

### 7.4 Database Connection Test
```bash
# Login to MySQL
mysql -u ai_professor_user -p ai_professor_db

# Check tables
SHOW TABLES;

# Check users
SELECT id, name, email, role FROM users LIMIT 5;

EXIT;
```

---

## Part 8: Monitoring and Maintenance

### 8.1 PM2 Monitoring Commands
```bash
# View all processes
pm2 list

# View logs in real-time
pm2 logs ai-professor

# Restart application
pm2 restart ai-professor

# Stop application
pm2 stop ai-professor

# Delete from PM2
pm2 delete ai-professor

# Monitor CPU/Memory usage
pm2 monit
```

### 8.2 Database Backup Script
Create a daily backup script:
```bash
nano /root/backup-database.sh
```

**Paste this script:**
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ai_professor_db_$DATE.sql"

mkdir -p $BACKUP_DIR

mysqldump -u ai_professor_user -p'your_secure_password_here' ai_professor_db > $BACKUP_DIR/$FILENAME

# Compress backup
gzip $BACKUP_DIR/$FILENAME

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $FILENAME.gz"
```

**Make executable and schedule:**
```bash
chmod +x /root/backup-database.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /root/backup-database.sh >> /var/log/db-backup.log 2>&1
```

### 8.3 Application Update Process
When you need to update the application:
```bash
cd /var/www/ai-professor

# Pull latest code (if using Git)
git pull origin main

# Or upload new files via SCP/FTP

# Install new dependencies
pnpm install --prod

# Run database migrations
pnpm db:push

# Rebuild application
pnpm run build

# Restart PM2
pm2 restart ai-professor

# Clear Nginx cache (if applicable)
systemctl reload nginx
```

---

## Part 9: Troubleshooting

### Common Issues and Solutions

#### Issue 1: Application won't start
```bash
# Check PM2 logs
pm2 logs ai-professor --err

# Check if port 3000 is already in use
netstat -tuln | grep 3000

# Check environment variables
cat /var/www/ai-professor/.env

# Restart PM2
pm2 restart ai-professor
```

#### Issue 2: Database connection errors
```bash
# Test database connection
mysql -u ai_professor_user -p ai_professor_db

# Check DATABASE_URL in .env file
cat /var/www/ai-professor/.env | grep DATABASE_URL

# Verify MySQL is running
systemctl status mysql
```

#### Issue 3: Nginx 502 Bad Gateway
```bash
# Check if Node.js app is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/ai-professor-error.log

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Issue 4: SSL certificate issues
```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew --force-renewal

# Restart Nginx after renewal
systemctl restart nginx
```

#### Issue 5: High memory usage
```bash
# Check PM2 memory usage
pm2 monit

# Restart application to clear memory
pm2 restart ai-professor

# Adjust max_memory_restart in ecosystem.config.js
nano ecosystem.config.js
# Change: max_memory_restart: '2G'
pm2 restart ai-professor
```

---

## Part 10: Security Best Practices

### 10.1 Secure MySQL
```bash
# Disable remote root login (already done in mysql_secure_installation)
# Use strong passwords for database users
# Regularly update MySQL
apt update && apt upgrade mysql-server
```

### 10.2 Keep System Updated
```bash
# Update system packages weekly
apt update && apt upgrade -y

# Update Node.js packages
cd /var/www/ai-professor
pnpm update
```

### 10.3 Monitor Logs for Suspicious Activity
```bash
# Check Nginx access logs for unusual patterns
tail -f /var/log/nginx/ai-professor-access.log

# Check application logs
pm2 logs ai-professor
```

### 10.4 Enable Fail2Ban (Optional)
```bash
# Install Fail2Ban to block repeated failed login attempts
apt install -y fail2ban

# Configure for Nginx
nano /etc/fail2ban/jail.local
```

---

## Part 11: Performance Optimization

### 11.1 Enable Nginx Caching
Add to Nginx configuration:
```nginx
# Add inside server block
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    proxy_pass http://localhost:3000;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 11.2 Enable PM2 Cluster Mode
Already configured in `ecosystem.config.js`:
```javascript
instances: 'max',  // Uses all CPU cores
exec_mode: 'cluster'
```

### 11.3 Database Optimization
```sql
-- Add indexes for frequently queried columns
-- Login to MySQL:
mysql -u ai_professor_user -p ai_professor_db

-- Add indexes (example):
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user_id ON tutor_sessions(userId);
```

---

## 📊 Deployment Checklist

- [ ] VPS provisioned with Ubuntu 20.04+
- [ ] Node.js 22.x installed
- [ ] pnpm installed
- [ ] PM2 installed
- [ ] MySQL/MariaDB installed and secured
- [ ] Nginx installed
- [ ] Application files uploaded to `/var/www/ai-professor`
- [ ] Dependencies installed with `pnpm install --prod`
- [ ] `.env` file configured with all required variables
- [ ] Database migrations run with `pnpm db:push`
- [ ] PM2 started and configured for auto-restart
- [ ] Nginx configured and tested
- [ ] SSL certificate obtained with Certbot
- [ ] Firewall configured (UFW)
- [ ] Website accessible via HTTPS
- [ ] Database backup script configured
- [ ] Monitoring set up (PM2 logs, Nginx logs)

---

## 🎯 Quick Reference Commands

### Application Management
```bash
pm2 start ecosystem.config.js    # Start application
pm2 restart ai-professor          # Restart application
pm2 stop ai-professor             # Stop application
pm2 logs ai-professor             # View logs
pm2 monit                         # Monitor resources
```

### Nginx Management
```bash
systemctl restart nginx           # Restart Nginx
systemctl reload nginx            # Reload configuration
nginx -t                          # Test configuration
tail -f /var/log/nginx/ai-professor-access.log  # View access logs
```

### Database Management
```bash
mysql -u ai_professor_user -p ai_professor_db   # Login to database
pnpm db:push                      # Run migrations
/root/backup-database.sh          # Manual backup
```

### SSL Certificate
```bash
certbot renew                     # Renew certificate
certbot certificates              # Check status
```

---

## 📞 Support and Resources

### Documentation
- Node.js: https://nodejs.org/docs
- PM2: https://pm2.keymetrics.io/docs
- Nginx: https://nginx.org/en/docs
- Let's Encrypt: https://letsencrypt.org/docs

### Hostinger Resources
- Hostinger VPS Documentation: https://support.hostinger.com/en/collections/1742614-vps
- Hostinger Support: https://support.hostinger.com

---

## 🎉 Deployment Complete!

Your AI Professor platform is now live and ready for production use!

**Next Steps:**
1. Test all features thoroughly
2. Create admin accounts for your team
3. Configure payment gateway (Stripe)
4. Set up monitoring and alerts
5. Plan regular backups and updates
6. Monitor performance and scale as needed

**Production URL:** https://your-domain.com

**Test Credentials:**
- Email: `student1@acesaiprofessor.com`
- Password: `demo123`

---

*Last Updated: December 10, 2025*
*AI Professor Platform v1.0*
