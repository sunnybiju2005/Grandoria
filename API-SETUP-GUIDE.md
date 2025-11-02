# API Setup Guide for Billing Software Integration

This guide will help you set up the API server to connect your billing software with the Gaurikeerthana Residency booking system.

## 📋 Prerequisites

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Firebase Service Account Key**
   - Access to Firebase Console

---

## 🚀 Quick Setup

### Step 1: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install:
- Express (web server)
- Firebase Admin SDK
- CORS (cross-origin support)
- dotenv (environment variables)

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **gaurikeerthana-residency-c3ba4**
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file as `serviceAccountKey.json` in the project root
   - **CRITICAL:** This file contains sensitive credentials. Never share it or commit to Git!

### Step 3: Configure Environment

Create a `.env` file in the project root:

```env
# API Security Key - CHANGE THIS TO YOUR OWN SECURE KEY
API_KEY=your-very-secure-api-key-here-change-this-2025

# Server Port
PORT=3000

# Environment
NODE_ENV=production
```

**Important:** Replace `your-very-secure-api-key-here-change-this-2025` with a strong, unique API key.

### Step 4: Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
🚀 Gaurikeerthana Residency API Server
📊 Running on port 3000
🔗 Health check: http://localhost:3000/api/health
📚 API Documentation: See API-DOCUMENTATION.md
🔑 API Key required for all endpoints (except /api/health)
✅ Firebase Admin SDK initialized successfully
```

### Step 5: Test the API

Open your browser or use cURL:

```bash
curl http://localhost:3000/api/health
```

You should get:
```json
{
  "success": true,
  "message": "Gaurikeerthana Residency API is running",
  "version": "1.0.0",
  ...
}
```

---

## 🔌 Connecting Your Billing Software

### Method 1: Direct HTTP Requests

Your billing software can make HTTP requests to the API endpoints. See `API-DOCUMENTATION.md` for detailed examples.

### Method 2: Webhook Integration

You can modify the API to send webhooks to your billing software when bookings are created/updated.

### Method 3: Scheduled Sync

Set up a scheduled job (cron) to periodically sync data:

```bash
# Example: Sync every hour
0 * * * * curl -H "X-API-Key: your-key" http://localhost:3000/api/bookings
```

---

## 🔒 Security Checklist

- [ ] Changed default API key in `.env`
- [ ] `serviceAccountKey.json` is NOT in Git (check .gitignore)
- [ ] `.env` file is NOT in Git
- [ ] Using HTTPS in production
- [ ] Firewall configured (only allow specific IPs if needed)
- [ ] Regular API key rotation scheduled

---

## 📊 Common Use Cases

### 1. Fetch Daily Bookings

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/api/bookings?startDate=2024-01-27&endDate=2024-01-27&status=confirmed"
```

### 2. Generate Monthly Revenue Report

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/api/revenue?startDate=2024-01-01&endDate=2024-01-31&groupBy=day"
```

### 3. Export All Bookings to CSV

```bash
curl -H "X-API-Key: your-key" \
  "http://localhost:3000/api/export/csv" \
  -o bookings-export.csv
```

### 4. Sync Booking from Billing Software

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "guestName": "John Doe",
    "phone": "9876543210",
    "arrivalDate": "2024-02-01",
    "departureDate": "2024-02-03",
    "roomType": "deluxe-ac",
    "total": 9450
  }' \
  http://localhost:3000/api/bookings
```

---

## 🐛 Troubleshooting

### Error: "Firebase Admin SDK initialization failed"

**Solution:**
- Check if `serviceAccountKey.json` exists in project root
- Verify the JSON file is valid
- Ensure Firebase project is active

### Error: "Unauthorized. Invalid API key"

**Solution:**
- Check `.env` file has `API_KEY` set
- Verify the API key in request header matches `.env`
- Header should be: `X-API-Key: your-key`

### Error: "Cannot find module"

**Solution:**
- Run `npm install` again
- Check `package.json` exists
- Verify Node.js version: `node --version` (should be 14+)

### Port Already in Use

**Solution:**
- Change `PORT` in `.env` file
- Or stop the process using port 3000
- On Windows: `netstat -ano | findstr :3000`
- On Mac/Linux: `lsof -i :3000`

---

## 📱 Production Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start API server
pm2 start api-server.js --name gaurikeerthana-api

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/gaurikeerthana-api.service`:

```ini
[Unit]
Description=Gaurikeerthana Residency API
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/Grandoria
ExecStart=/usr/bin/node api-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable gaurikeerthana-api
sudo systemctl start gaurikeerthana-api
```

### Option 3: Docker

Create `Dockerfile`:
```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "api-server.js"]
```

Build and run:
```bash
docker build -t gaurikeerthana-api .
docker run -d -p 3000:3000 --env-file .env gaurikeerthana-api
```

---

## 🔄 Data Sync Flow

```
Billing Software  ←→  API Server  ←→  Firebase Database  ←→  Website
```

1. **Billing Software** sends booking data → **API Server**
2. **API Server** validates and saves → **Firebase Database**
3. **Website** reads from → **Firebase Database** (already configured)
4. **API Server** can also read from **Firebase Database** → send to **Billing Software**

---

## 📞 Support

Need help? Contact:
- Email: Gaurikeerthanagvyr@gmail.com
- Phone: +91 994779277

---

## 📝 Next Steps

1. ✅ Complete setup steps above
2. ✅ Test API with health check
3. ✅ Test with a sample booking creation
4. ✅ Integrate with your billing software
5. ✅ Set up scheduled sync (if needed)
6. ✅ Configure production deployment

---

**Version:** 1.0.0  
**Last Updated:** January 2025



