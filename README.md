# 🚀 PayTrack - Full-Stack MERN Project

A comprehensive full-stack application for managing **money, workers, agriculture, and real estate** with modern UI and powerful analytics.

## ✨ Features

### 🏗️ **Worker & Payroll Management**
- Add/Edit/Delete workers with detailed information
- Record payments with payment modes (Cash/UPI)
- Track total payments per worker
- Payroll summary with analytics

### 🌾 **Agriculture Management**
- Manage crop cultivations with area tracking (Bigha)
- Track costs, revenue, and pending payments
- Crop-wise profit/loss analysis
- Payment mode tracking

### 🏠 **Real Estate Management**
- Property transactions (Buy/Sell operations)
- Area tracking in Bigha/Gaj units
- Partner management
- Investment vs Revenue tracking

### 📊 **Analytics Dashboard**
- Unified dashboard with interactive charts
- Income vs Expenses over time
- Payment mode distribution
- Category-wise summaries
- Powered by Recharts

## 🛠️ Tech Stack

### **Backend**
- **Node.js** + **Express.js** + **TypeScript**
- **MongoDB** + **Mongoose** ODM
- **JWT** authentication with bcrypt
- **Express Validator** for input validation
- **Helmet** + **CORS** for security

### **Frontend**
- **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls

### **DevOps**
- **Docker** containerization
- **Docker Compose** for orchestration
- **Nginx** for frontend serving

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or use Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PayTrack
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your MongoDB URI and JWT secret
   ```

3. **Start MongoDB** (if not using Docker)
   ```bash
   mongod
   ```

4. **Start backend**
   ```bash
   npm run backend
   ```

5. **Start frontend** (in new terminal)
   ```bash
   npm run frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
PayTrack/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── Dockerfile          # Backend Docker config
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   ├── lib/            # Utilities & API
│   │   └── App.tsx         # Main app component
│   ├── Dockerfile          # Frontend Docker config
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Register** a new account at `/login`
2. **Login** with your credentials
3. **JWT token** is automatically stored and used for API calls
4. **Protected routes** require valid authentication

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/summary/worker/:id` - Worker payment summary

### Cultivations
- `GET /api/cultivations` - Get all cultivations
- `POST /api/cultivations` - Create cultivation
- `PUT /api/cultivations/:id` - Update cultivation
- `DELETE /api/cultivations/:id` - Delete cultivation
- `GET /api/cultivations/summary/crops` - Crop summary

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/summary/overview` - Property overview

### Analytics
- `GET /api/analytics/dashboard` - Unified dashboard data
- `GET /api/analytics/workers` - Worker analytics
- `GET /api/analytics/agriculture` - Agriculture analytics
- `GET /api/analytics/real-estate` - Real estate analytics

## 🎨 UI Components

The application uses a modern, responsive design with:

- **Sidebar navigation** with active state indicators
- **Data tables** with sorting and filtering
- **Modal forms** for CRUD operations
- **Interactive charts** powered by Recharts
- **Responsive design** for mobile and desktop
- **Loading states** and error handling

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm start           # Start production build
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Database Operations
```bash
# Connect to MongoDB
mongosh "mongodb://admin:password123@localhost:27017/paytrack?authSource=admin"

# View collections
show collections

# Query data
db.workers.find()
db.payments.find()
db.cultivations.find()
db.properties.find()
```

## 🚀 Deployment

### Production Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret

# Frontend (build-time)
VITE_API_URL=https://your-api-domain.com
```

### Docker Production
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 📈 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Health Checks
- Backend: `GET /health`
- Frontend: Automatic health monitoring
- Database: Connection status in logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using modern web technologies** 