# FleetFlow – Modular Fleet & Logistics Management System

**Production-ready web application for comprehensive fleet and logistics management with AI-powered insights.**

---

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based authentication with 4 role-based access levels (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- **Dashboard Command Center**: Real-time KPIs, charts for fuel trends, revenue vs expenses, utilization metrics
- **Vehicle Registry**: Complete CRUD operations with status management, ROI tracking, and capacity monitoring
- **Driver Management**: Driver records with safety score tracking, license expiry alerts, and performance metrics
- **Trip Dispatcher**: Smart trip creation with validation rules, vehicle/driver assignment, lifecycle management (Draft → Dispatched → Completed → Cancelled)
- **Fuel Logging**: Track fuel consumption with AI-powered anomaly detection (20% threshold)
- **Maintenance Tracking**: Service history logging with automatic vehicle status updates
- **Analytics & Reports**: Financial reports, ROI rankings, top driver leaderboards, expense breakdown with CSV/PDF exports

### AI-Powered Features
1. **Smart Vehicle Suggestion**: AI recommends optimal vehicles for trips based on fuel efficiency (40%), capacity match (30%), and maintenance history (30%)
2. **Predictive Maintenance**: ML model predicts maintenance needs based on odometer readings, service history, and fuel efficiency trends
3. **Driver Risk Scoring**: Calculates safety scores (0-100) using completion rates, late trips, violations, and incidents
4. **Fuel Anomaly Detection**: Identifies unusual fuel consumption patterns with 20% deviation threshold and provides possible causes

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** 4.18 - REST API server
- **MongoDB** + **Mongoose** 8.0 - NoSQL database with ODM
- **JWT** (jsonwebtoken 9.0) - Token-based authentication
- **Socket.io** 4.6 - Real-time bidirectional communication
- **CSV-Writer** 1.6 + **PDFKit** 0.13 - Data export functionality
- **bcryptjs** 2.4 - Password hashing
- **Express-Validator** - Input validation
- **Axios** - HTTP client for AI service integration
- **Nodemailer** - Email notifications

### Frontend
- **React** 18.2 + **Vite** 5.0 - Modern build tooling
- **React Router DOM** 6.21 - Client-side routing
- **Tailwind CSS** 3.4 - Utility-first styling
- **Chart.js** 4.4 + **react-chartjs-2** 5.2 - Data visualization
- **Radix UI** - Accessible component primitives
- **Axios** 1.6 - API communication
- **Socket.io-client** 4.6 - Real-time updates
- **Lucide React** - Icon library
- **React Hot Toast** 2.4 - Notifications

### AI Microservice
- **Python** 3.8+ + **Flask** 3.0 - Lightweight ML service
- **scikit-learn** 1.3 - Machine learning algorithms
- **NumPy** 1.26 - Numerical computations
- **Flask-CORS** 4.0 - Cross-origin resource sharing

---

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **MongoDB** 4.4+ (local or Atlas)
- **Python** 3.8+ and pip
- Git

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "oddo hackathon"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/fleetflow
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
AI_SERVICE_URL=http://localhost:5001
```

### 3. AI Service Setup
```bash
cd ../ai-service
pip install -r requirements.txt
```

Create `.env` file in the `ai-service` directory:
```env
FLASK_ENV=development
PORT=5001
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup

Seed the database with sample data (includes demo users, vehicles, drivers, trips):

```bash
cd backend
npm run seed
```

This will create:
- **4 demo users** (one per role)
- **5 vehicles** (Trucks, Vans, Bike with varied statuses)
- **5 drivers** (with different safety scores)
- **5 trips** (Draft, Dispatched, Completed states)
- **Fuel logs, maintenance logs, expenses**

---

## 🚀 Running the Application

You need **3 terminal windows**:

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: **http://localhost:5000**

### Terminal 2: AI Microservice
```bash
cd ai-service
python app.py
```
AI service runs on: **http://localhost:5001**

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 🔑 Demo Credentials

After running `npm run seed`, use these credentials to login:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Fleet Manager** | manager@fleetflow.com | password123 | Full access to all modules |
| **Dispatcher** | dispatcher@fleetflow.com | password123 | Trip management, vehicle/driver assignment |
| **Safety Officer** | safety@fleetflow.com | password123 | Driver safety, maintenance logs |
| **Financial Analyst** | finance@fleetflow.com | password123 | Analytics, reports, expense tracking |

---

## 📁 Project Structure

```
oddo hackathon/
├── backend/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/                    # Mongoose schemas (7 models)
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Trip.js
│   │   ├── FuelLog.js
│   │   ├── MaintenanceLog.js
│   │   └── Expense.js
│   ├── controllers/               # Business logic (7 controllers)
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── tripController.js
│   │   ├── fuelLogController.js
│   │   ├── maintenanceLogController.js
│   │   └── dashboardController.js
│   ├── routes/                    # API endpoints (8 route files)
│   ├── middleware/                # Auth, error handling
│   ├── utils/
│   │   └── seed.js               # Database seeding utility
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── ai-service/
│   ├── app.py                    # Flask AI microservice (4 endpoints)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx        # Main layout with sidebar
    │   │   └── ui/               # Reusable UI components
    │   ├── pages/                # 7 main pages
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx     # KPIs + Charts
    │   │   ├── Vehicles.jsx      # Vehicle CRUD
    │   │   ├── Drivers.jsx       # Driver CRUD
    │   │   ├── Trips.jsx         # Trip dispatcher
    │   │   ├── FuelLogs.jsx      # Fuel tracking
    │   │   ├── MaintenanceLogs.jsx
    │   │   └── Analytics.jsx     # Reports + Exports
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication state
    │   ├── services/
    │   │   └── api.js            # Axios instance
    │   ├── lib/
    │   │   └── utils.js          # Helper functions
    │   ├── App.jsx               # Router + Routes
    │   └── main.jsx              # React entry point
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 🔌 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/available` - Get available vehicles
- `POST /api/vehicles` - Create vehicle (Fleet Manager)
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Drivers
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/available` - Get available drivers
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `POST /api/drivers/:id/update-safety-score` - Update AI safety score
- `DELETE /api/drivers/:id` - Delete driver

### Trips
- `GET /api/trips` - Get all trips (with filters)
- `POST /api/trips` - Create trip (Dispatcher)
- `POST /api/trips/suggest-vehicle` - Get AI vehicle recommendation
- `PUT /api/trips/:id` - Update trip status
- `DELETE /api/trips/:id` - Delete trip

### Fuel Logs
- `GET /api/fuel-logs` - Get all fuel logs
- `POST /api/fuel-logs` - Create fuel log (auto-detects anomalies)

### Maintenance Logs
- `GET /api/maintenance-logs` - Get all logs
- `GET /api/maintenance-logs/predict/:vehicleId` - Get AI prediction
- `POST /api/maintenance-logs` - Create log

### Dashboard & Analytics
- `GET /api/dashboard/kpis` - Get key performance indicators
- `GET /api/dashboard/fuel-trend?period=30` - Get fuel cost trend
- `GET /api/dashboard/revenue-vs-expenses?period=6` - Get financial comparison
- `GET /api/dashboard/vehicle-analytics` - Get vehicle ROI rankings
- `GET /api/dashboard/top-drivers` - Get top performing drivers
- `GET /api/dashboard/expense-breakdown` - Get expense by category

### Export
- `GET /api/export/vehicles/csv` - Export vehicles to CSV
- `GET /api/export/trips/csv` - Export trips to CSV
- `GET /api/export/drivers/csv` - Export drivers to CSV
- `GET /api/export/financial-report/pdf` - Generate financial PDF report

---

## 🤖 AI Service Endpoints

All AI endpoints are called internally by the backend:

- `POST /api/ai/suggest-vehicle` - Score vehicles for trip assignment
- `POST /api/ai/predict-maintenance` - Predict maintenance needs
- `POST /api/ai/driver-risk-score` - Calculate driver safety score
- `POST /api/ai/detect-fuel-anomaly` - Detect fuel consumption anomalies

---

## 🎨 Key UI Components

- **Dashboard**: KPI cards, Line chart (fuel trend), Bar chart (revenue vs expenses)
- **Vehicles Page**: CRUD interface with filters, status badges, ROI display
- **Drivers Page**: Safety score visualization, license expiry warnings, AI score update
- **Trips Page**: Trip dispatcher with AI vehicle suggestion, status lifecycle management
- **Fuel Logs**: Anomaly alerts with warnings, cost tracking
- **Maintenance Logs**: Predictive maintenance with urgency levels, service type dropdown
- **Analytics**: ROI rankings, top drivers leaderboard, expense pie chart, export buttons

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed with secret, 30-day expiration
- **Role-Based Access Control (RBAC)**: Middleware authorization for protected routes
- **Input Validation**: Express-validator on all POST/PUT endpoints
- **CORS Configuration**: Restricted origins for API security
- **Protected Routes**: Frontend route guards with redirect to login

---

## 🌐 Real-time Features

Socket.io is configured for:
- Trip status updates
- Vehicle status changes
- Dashboard metrics refresh
- Driver availability updates

*(Real-time event emission can be added to controllers as needed)*

---

## 📊 Database Schema Highlights

### Users
- Roles: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst
- Password hashing with pre-save hook
- JWT token generation method

### Vehicles
- Virtual field: `roi` (calculated from revenue and acquisition cost)
- Status: Active, In Shop, Out of Service
- Tracks odometer, fuel efficiency, capacity

### Drivers
- Virtual fields: `isLicenseExpired`, `isAvailableForTrip`
- Safety score (0-100) with AI update capability
- Tracks completed trips, late trips, violations, incidents

### Trips
- Lifecycle: Draft → Dispatched → Completed / Cancelled
- Validation: Cargo weight vs vehicle capacity, license expiry checks
- Auto-calculates `isLate` based on estimated vs actual duration

### Fuel Logs
- AI anomaly detection flag (`isAnomalous`)
- Stores anomaly reason and expected vs actual consumption

### Maintenance Logs
- Auto-updates vehicle status to "In Shop" on creation
- Service types: Oil Change, Tire Replacement, Brake Service, etc.

### Expenses
- Categories: Fuel, Maintenance, Insurance, Registration, Toll, Repair, Other
- Reference to Vehicle, Driver, Trip, FuelLog, or MaintenanceLog

---

## 🚧 Future Enhancements

- [ ] Real-time Socket.io event broadcasting in frontend
- [ ] Email notifications for maintenance alerts
- [ ] Mobile app with React Native
- [ ] GPS tracking integration
- [ ] Route optimization algorithm
- [ ] Multi-tenant support for fleet companies
- [ ] Advanced AI models (LSTM for time-series prediction)
- [ ] Geofencing and alerts
- [ ] Driver mobile app for trip updates

---

## 🤝 Contributing

This is a hackathon project. For production use:
1. Change all default secrets in `.env` files
2. Use environment-specific configurations
3. Set up SSL/TLS for HTTPS
4. Configure MongoDB authentication
5. Implement rate limiting and API throttling
6. Add comprehensive error logging (Winston, Sentry)
7. Set up CI/CD pipeline
8. Add unit and integration tests

---

## 📄 License

MIT License - Feel free to use this project for learning and hackathons.

---

## 👥 Support

For questions or issues:
- Check the API documentation above
- Review the demo credentials section
- Ensure all 3 services (backend, AI, frontend) are running
- Verify MongoDB connection string in backend `.env`

---

## 🏆 Hackathon Ready

This project is **production-ready** for demo purposes with:
- ✅ Complete authentication system
- ✅ All CRUD operations functional
- ✅ 4 AI features implemented
- ✅ Real-time capabilities configured
- ✅ Export functionality (CSV + PDF)
- ✅ Responsive design
- ✅ Seed data for instant demo
- ✅ Role-based access control
- ✅ Professional UI with charts and analytics

**Happy Fleet Managing! 🚚📊**
