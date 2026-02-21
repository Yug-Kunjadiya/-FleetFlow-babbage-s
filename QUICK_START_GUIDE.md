# FleetFlow - Quick Start Guide

## 🚀 All Services Running

### Service URLs
- **Frontend (React)**: http://localhost:5173
- **Backend (Express)**: http://localhost:5000
- **AI Service (Flask)**: http://localhost:5001

---

## 🔐 Test Credentials

### Fleet Manager (Full Access)
- **URL**: http://localhost:5173/login/manager
- **Email**: manager@fleetflow.com
- **Password**: password123
- **Capabilities**: All features, vehicle/driver/trip management, analytics

### Dispatcher (Operations Focus)
- **URL**: http://localhost:5173/login/dispatcher
- **Email**: dispatcher@fleetflow.com
- **Password**: password123
- **Capabilities**: Trip management, driver coordination, real-time tracking

### Safety Officer (Compliance Focus)
- **URL**: http://localhost:5173/login/safety
- **Email**: safety@fleetflow.com
- **Password**: password123
- **Capabilities**: Safety reports, maintenance monitoring, compliance tracking

### Financial Analyst (Cost Focus)
- **URL**: http://localhost:5173/login/financial
- **Email**: financial@fleetflow.com
- **Password**: password123
- **Capabilities**: Financial reports, cost analysis, expense tracking

---

## ✨ Key Features

### ✅ FIXED: AI Predictive Maintenance
- Navigate to **Maintenance Logs** page
- Click **"Predict"** button on any vehicle
- AI analyzes odometer, service history, and fuel efficiency
- Provides maintenance recommendations with confidence scores
- **Status**: ✅ WORKING (AI service running on port 5001)

### ✅ Role-Based Dashboards
- Different KPIs for each role
- Manager: Fleet performance, revenue, costs
- Dispatcher: Active trips, driver availability
- Safety: Compliance, incident rates
- Financial: Revenue, expenses, ROI

### ✅ Real-Time Updates
- Socket.io for live trip status changes
- Instant notifications for maintenance logs
- Real-time dashboard updates

### ✅ Complete Fleet Management
- **Vehicles**: Add, edit, track status, monitor maintenance
- **Drivers**: Manage profiles, track performance, safety scoring
- **Trips**: Create trips, assign drivers, track progress
- **Maintenance**: Log services, predict future needs with AI
- **Analytics**: Charts, reports, financial breakdowns

---

## 📊 Current Database Status
- **Vehicles**: 9 (various types: cargo vans, passenger, pickups, box trucks)
- **Drivers**: 8 (with ratings, contacts, licenses)
- **Active Trips**: 2 (in progress)
- **Completed Trips**: 7 (this month)

---

## 🎯 How to Use the Prediction Feature

1. **Login** as any role (Manager recommended)
2. Navigate to **Maintenance Logs** page from sidebar
3. Scroll to the **"Vehicles"** section
4. Find any vehicle card
5. Click the **"Predict"** button
6. View AI-powered maintenance prediction with:
   - Maintenance urgency (Yes/No)
   - Days until service needed
   - Confidence level
   - Detailed reasons
   - Recommended actions

---

## 🛠️ Technical Architecture

### Backend (Node.js/Express)
- RESTful API
- MongoDB Atlas database
- JWT authentication
- Socket.io for real-time features
- Comprehensive error handling

### Frontend (React/Vite)
- Modern React with hooks
- Tailwind CSS for styling
- Chart.js for analytics
- React Router for navigation
- Hot Module Replacement (HMR)

### AI Service (Flask/Python)
- Predictive maintenance algorithm
- Vehicle recommendation engine
- Scikit-learn for advanced predictions
- CORS-enabled for frontend integration

---

## 🐛 Issues Resolved

### ✅ Maintenance Prediction Not Working
- **Problem**: AI service was not running
- **Solution**: Started Flask app on port 5001
- **Status**: FIXED - All predictions working

### ✅ Financial Login Error
- **Problem**: User reported login issues
- **Solution**: Verified endpoint working correctly
- **Status**: VERIFIED - Login works perfectly

---

## 📱 Pages Available

1. **Dashboard**: Role-specific KPIs and overview
2. **Vehicles**: Full vehicle management
3. **Drivers**: Driver profiles and performance
4. **Trips**: Trip planning and tracking
5. **Maintenance Logs**: Service history + AI predictions
6. **Analytics**: Charts, graphs, financial reports
7. **Fuel Logs**: Fuel consumption tracking
8. **Expense Tracker**: Cost management

---

## 🎨 UI Design Features

- **Gradient backgrounds** for login pages (role-specific colors)
- **Loading skeletons** for better UX
- **Role badges** on dashboard
- **Responsive tables** with hover effects
- **Interactive charts** with Chart.js
- **Toast notifications** for user feedback
- **Modal dialogs** for forms
- **Card-based layouts** for data display

---

## 🚦 How to Restart Services (if needed)

### AI Service (Port 5001)
```powershell
cd "d:\oddo hackathon\ai-service"
python app.py
```

### Backend (Port 5000)
```powershell
cd "d:\oddo hackathon\backend"
npm start
```

### Frontend (Port 5173)
```powershell
cd "d:\oddo hackathon\frontend"
npm run dev
```

---

## ✅ All Systems Operational!

**Everything is working perfectly. Access your fleet management system at:**
👉 **http://localhost:5173**

Enjoy your FleetFlow experience! 🚛✨
