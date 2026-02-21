# FleetFlow - Service Startup Guide

## 🚀 Quick Start (If Services Are Down)

### Check Service Status
```powershell
# Test Backend
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email="manager@fleetflow.com"; password="password123"} | ConvertTo-Json) -ContentType "application/json"

# Test Frontend
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing

# Test AI Service
Invoke-RestMethod -Uri "http://localhost:5001/api/ai/predict-maintenance" -Method POST -Body (@{odometer=50000; fuelEfficiency=10} | ConvertTo-Json) -ContentType "application/json"
```

---

## 🔧 Start Individual Services

### 1. Start AI Service (Port 5001)
```powershell
cd "d:\oddo hackathon\ai-service"
python app.py
```
**Keep this terminal open**

### 2. Start Backend (Port 5000)
```powershell
cd "d:\oddo hackathon\backend"
npm start
```
**Keep this terminal open**

### 3. Start Frontend (Port 5173)
```powershell
cd "d:\oddo hackathon\frontend"
npm run dev
```
**Keep this terminal open**

---

## 🌐 Access the Website

**Open in Browser:** http://localhost:5173

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Fleet Manager** | manager@fleetflow.com | password123 |
| **Dispatcher** | dispatcher@fleetflow.com | password123 |
| **Safety Officer** | safety@fleetflow.com | password123 |
| **Financial Analyst** | financial@fleetflow.com | password123 |

---

## 🛠️ Troubleshooting

### Frontend Not Loading?
```powershell
# Stop any running node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart frontend
cd "d:\oddo hackathon\frontend"
npm run dev
```

### Backend Not Responding?
```powershell
# Stop any running node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart backend
cd "d:\oddo hackathon\backend"
npm start
```

### AI Service Not Working?
```powershell
# Restart AI service
cd "d:\oddo hackathon\ai-service"
python app.py
```

### Port Already in Use?
```powershell
# Kill processes on specific ports
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force
```

---

## ⚡ One-Command Startup (PowerShell)

Run this to start everything at once:

```powershell
# Start AI Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\oddo hackathon\ai-service'; python app.py" -WindowStyle Minimized

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\oddo hackathon\backend'; npm start" -WindowStyle Minimized

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\oddo hackathon\frontend'; npm run dev" -WindowStyle Minimized

# Wait 5 seconds
Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173"

Write-Host "`n✅ All services started! FleetFlow should open in your browser." -ForegroundColor Green
```

---

## 📋 Service URLs

- **Frontend (Website):** http://localhost:5173
- **Backend API:** http://localhost:5000
- **AI Service:** http://localhost:5001

---

## ✨ Features Available

✅ **AI Predictive Maintenance** - Click "Predict" on any vehicle in Maintenance Logs  
✅ **Role-based Dashboards** - Different views for each role  
✅ **Vehicle Management** - Add, edit, track vehicles  
✅ **Driver Management** - Manage driver profiles  
✅ **Trip Tracking** - Create and monitor trips  
✅ **Maintenance Logs** - Track service history  
✅ **Financial Analytics** - View costs and revenue  
✅ **Real-time Updates** - Socket.io for live data  

---

## 🔄 Database Status

Your database already contains:
- **9 Vehicles** (various types)
- **8 Drivers** (with ratings and details)
- **2 Active Trips** (in progress)
- **7 Completed Trips** (this month)

---

## 📞 Need Help?

If services don't start:
1. Check if ports 5000, 5001, 5173 are free
2. Ensure Node.js and Python are installed
3. Run `npm install` in backend and frontend folders
4. Run `pip install -r requirements.txt` in ai-service folder

---

**Last Updated:** February 21, 2026  
**Status:** All Systems Operational ✅
