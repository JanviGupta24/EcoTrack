# 🌱 EcoTrack - Smart Waste Management System

A comprehensive full-stack MERN application with AI integration for efficient waste management, empowering citizens, workers, admins, and government bodies to collaborate for a cleaner environment.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access & refresh tokens
- Google OAuth 2.0 integration
- Email & SMS OTP verification (Nodemailer + Twilio)
- Role-based access control (User, Worker, Admin, Super Admin, Green Champion)
- Secure password reset functionality

### 🗑️ Waste Management
- Report waste with image upload and location
- AI-powered waste classification (GPT-4 Vision)
- Real-time status tracking (Pending → Assigned → Collected → Processed)
- Nearby facility finder with map integration
- Rating & feedback system

### 🤖 AI Integration
- **AI Chatbot:** Interactive assistant for recycling tips and queries
- **Waste Classifier:** Automatic waste type detection from images
- **Admin AI Agent:** Generates insights and analytics
- **Quiz Generator:** AI-powered educational content

### 💰 Payment & Rewards
- Razorpay/Stripe integration
- Eco-points system (earn by reporting waste)
- Point-to-cash conversion
- Digital wallet management
- Transaction history

### 📚 Training Hub
- Video-based eco-education modules
- AI-generated quizzes
- Certification system
- Badge collection
- Progress tracking

### 📊 Analytics & Dashboards
- Role-specific dashboards
- Interactive charts (Recharts)
- Real-time statistics
- Leaderboard system
- Export data to Excel/PDF

### 🔔 Notifications
- Real-time in-app notifications
- Email alerts
- SMS notifications for critical updates
- Push notifications (optional)

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js v16+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, Passport.js, Google OAuth
- **File Upload:** Multer, Cloudinary
- **Email/SMS:** Nodemailer, Twilio
- **Payment:** Razorpay, Stripe
- **AI:** OpenAI GPT-4 & GPT-4 Vision

### Frontend
- **Library:** React 18
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **UI Components:** ShadCN UI, Lucide Icons
- **Charts/Maps:** Recharts, Google Maps API / Leaflet
- **HTTP/State:** Axios, Context API

### DevOps
- **Frontend Hosting:** Vercel / Netlify
- **Backend Hosting:** Render / Railway / Heroku
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary

---

## 📁 Project Structure

```text
ecotrack/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/Tushar-Mittal-09/Eco-Track-Website.git
cd Eco-Track-Website
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecotrack
# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecotrack

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Credentials (Email, Twilio, OpenAI, Razorpay/Stripe, etc.)
# ... configure your respective API keys here ...
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Start the frontend server:
```bash
npm start
```

---

## 🔑 API Endpoints Overview

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/google-login`
- **Waste Management:** `/api/waste/report`, `/api/waste/nearby-facilities`
- **AI:** `/api/ai/chatbot`, `/api/ai/classify-waste`
- **Payments:** `/api/payments/create-order`, `/api/payments/redeem-points`
- **Admin:** `/api/admin/stats`, `/api/admin/users`, `/api/admin/facilities`

---

## 👥 User Roles & Permissions

1. **User (Citizen):** Report waste, earn eco-points, access training modules.
2. **Worker:** View assigned reports, update collection status, track work stats.
3. **Admin (City Level):** Manage users & workers, assign reports, view analytics.
4. **Super Admin:** System-level control, financial oversight, export data.
5. **Green Champion:** Organize events, top contributor rewards, mentorship.

---

## 🎨 UI & 🔒 Security Features

- **UI:** Modern Design (green-blue theme), Mobile-first responsive, Dark Mode, Animations (Framer Motion), Interactive Charts, Accessibility (WCAG compliant).
- **Security:** Password hashing (bcrypt), JWT, Rate limiting, Input validation, CORS, Helmet.js headers, XSS & SQL injection prevention.

---

## 📱 Deployment

**Frontend (Vercel)**
```bash
cd frontend
vercel --prod
```

**Backend (Render)**
- Create new Web Service on Render
- Connect GitHub repository
- Set environment variables and deploy

**Database (MongoDB Atlas)**
- Create a cluster, whitelist IP addresses, and update the connection string.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License & Author

- **License:** This project is licensed under the MIT License - see LICENSE file for details.
- **Author:** Janvi Gupta

## 🙏 Acknowledgments
OpenAI, MongoDB Atlas, Cloudinary, Razorpay, and all open-source contributors.

---
*Made with ❤️ for a cleaner planet 🌍*
