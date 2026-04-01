🌱 EcoTrack - Smart Waste Management System
A comprehensive full-stack MERN application with AI integration for efficient waste management, empowering citizens, workers, admins, and government bodies to collaborate for a cleaner environment.

✨ Features
🔐 Authentication & Authorization
JWT-based authentication with access & refresh tokens
Google OAuth 2.0 integration
Email & SMS OTP verification (Nodemailer + Twilio)
Role-based access control (User, Worker, Admin, Super Admin, Green Champion)
Secure password reset functionality
🗑️ Waste Management
Report waste with image upload and location
AI-powered waste classification (GPT-4 Vision)
Real-time status tracking (Pending → Assigned → Collected → Processed)
Nearby facility finder with map integration
Rating & feedback system
🤖 AI Integration
AI Chatbot: Interactive assistant for recycling tips and queries
Waste Classifier: Automatic waste type detection from images
Admin AI Agent: Generates insights and analytics
Quiz Generator: AI-powered educational content
💰 Payment & Rewards
Razorpay/Stripe integration
Eco-points system (earn by reporting waste)
Point-to-cash conversion
Digital wallet management
Transaction history
📚 Training Hub
Video-based eco-education modules
AI-generated quizzes
Certification system
Badge collection
Progress tracking
📊 Analytics & Dashboards
Role-specific dashboards
Interactive charts (Recharts)
Real-time statistics
Leaderboard system
Export data to Excel/PDF
🔔 Notifications
Real-time in-app notifications
Email alerts
SMS notifications for critical updates
Push notifications (optional)
🛠️ Tech Stack
Backend
Runtime: Node.js v16+
Framework: Express.js
Database: MongoDB (Mongoose ODM)
Authentication: JWT, Passport.js, Google OAuth
File Upload: Multer, Cloudinary
Email: Nodemailer
SMS: Twilio
Payment: Razorpay, Stripe
AI: OpenAI GPT-4 & GPT-4 Vision
Frontend
Library: React 18
Styling: TailwindCSS
Animations: Framer Motion
UI Components: ShadCN UI, Lucide Icons
Charts: Recharts
Maps: Google Maps API / Leaflet
HTTP Client: Axios
State Management: Context API
DevOps
Frontend: Vercel / Netlify
Backend: Render / Railway / Heroku
Database: MongoDB Atlas
Storage: Cloudinary
📁 Project Structure
ecotrack/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── waste.controller.js
│   │   ├── ai.controller.js
│   │   └── payment.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── WasteReport.js
│   │   ├── Facility.js
│   │   ├── Transaction.js
│   │   └── Training.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── waste.routes.js
│   │   ├── ai.routes.js
│   │   └── payment.routes.js
│   ├── utils/
│   │   ├── email.js
│   │   ├── sms.js
│   │   ├── ai.js
│   │   └── notification.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── services.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ChatBot.js
│   │   │   ├── StatCard.js
│   │   │   └── Loader.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── Dashboard.js
│   │   │   ├── WasteReport.js
│   │   │   ├── Training.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── WorkerDashboard.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
🚀 Installation & Setup
Prerequisites
Node.js (v16 or higher)
MongoDB (local or Atlas)
npm or yarn
1. Clone Repository
bash
git clone https://github.com/yourusername/ecotrack.git
cd ecotrack
2. Backend Setup
bash
cd backend
npm install
Create .env file in backend directory:

env
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

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (Alternative)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
Start backend server:

bash
npm run dev
3. Frontend Setup
bash
cd ../frontend
npm install
Create .env file in frontend directory:

env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
Start frontend:

bash
npm start
🔑 API Endpoints
Authentication
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/google-login      - Google OAuth login
POST   /api/auth/send-otp          - Send OTP
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/forgot-password   - Forgot password
POST   /api/auth/reset-password    - Reset password
Waste Management
POST   /api/waste/report           - Create waste report
GET    /api/waste/reports          - Get all reports
GET    /api/waste/reports/:id      - Get report by ID
PATCH  /api/waste/reports/:id      - Update report
DELETE /api/waste/reports/:id      - Delete report
GET    /api/waste/nearby-facilities - Get nearby facilities
AI
POST   /api/ai/chatbot             - Chatbot conversation
POST   /api/ai/classify-waste      - Classify waste from image
POST   /api/ai/generate-insights   - Generate AI insights
POST   /api/ai/generate-quiz       - Generate quiz
Payments
POST   /api/payments/create-order   - Create Razorpay order
POST   /api/payments/verify-payment - Verify payment
POST   /api/payments/redeem-points  - Redeem eco points
GET    /api/payments/transactions   - Get transaction history
GET    /api/payments/wallet         - Get wallet balance
Admin
GET    /api/admin/stats            - Dashboard statistics
GET    /api/admin/users            - Get all users
PATCH  /api/admin/users/:id/role   - Update user role
GET    /api/admin/facilities       - Get all facilities
POST   /api/admin/facilities       - Create facility
GET    /api/admin/analytics        - Get analytics data
👥 User Roles & Permissions
1. User (Citizen)
Report waste with images
View nearby facilities
Earn eco-points
Access training modules
Redeem points
2. Worker
View assigned reports
Update collection status
Upload verification photos
Track work statistics
Access training
3. Admin (City Level)
Manage users & workers
Assign reports to workers
Manage facilities
View analytics
Access AI insights
4. Super Admin
System-level control
Financial oversight
AI model monitoring
Export all data
Manage admins
5. Green Champion
Top contributor features
Organize events
Access exclusive training
Mentorship opportunities
Enhanced rewards
🎨 UI Features
Modern Design: Clean, minimal green-blue theme
Responsive: Mobile-first design
Dark Mode: Toggle between light/dark themes
Animations: Smooth transitions with Framer Motion
Interactive Charts: Real-time data visualization
Map Integration: Location-based features
Accessibility: WCAG compliant
🔒 Security Features
Password hashing with bcrypt
JWT token authentication
Rate limiting
Input validation & sanitization
CORS protection
Helmet.js security headers
XSS protection
SQL injection prevention
📱 Deployment
Frontend (Vercel)
bash
cd frontend
vercel --prod
Backend (Render)
Create new Web Service on Render
Connect GitHub repository
Set environment variables
Deploy
Database (MongoDB Atlas)
Create cluster on MongoDB Atlas
Whitelist IP addresses
Update connection string in .env
🧪 Testing
bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
📈 Performance Optimization
Image optimization with Cloudinary
Lazy loading components
Code splitting
API caching
Database indexing
CDN for static assets
🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/AmazingFeature)
Commit changes (git commit -m 'Add AmazingFeature')
Push to branch (git push origin feature/AmazingFeature)
Open Pull Request
📄 License
This project is licensed under the MIT License - see LICENSE file for details.

👨‍💻 Author
Your Name - Tushar Mittal

🙏 Acknowledgments
OpenAI for GPT-4 API
MongoDB Atlas
Cloudinary
Razorpay
All open-source contributors
📞 Support
For support, email support@ecotrack.com or join our Slack channel.

Made with ❤️ for a cleaner planet 🌍

