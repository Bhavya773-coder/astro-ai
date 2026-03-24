# AstroAI - Vedic Astrology Platform

A comprehensive Vedic astrology platform with AI-powered insights, birth charts, numerology, and personalized horoscopes.

## 🌟 Features

- **AI Chat**: Personalized Vedic astrology consultations
- **Birth Charts**: Detailed astrological analysis with dasha periods
- **Numerology**: Complete numerological predictions
- **Horoscopes**: Daily, weekly, and monthly predictions
- **Reports**: Comprehensive astrological reports
- **Pro Subscriptions**: Premium features with unlimited access

## 🚀 Deployment Guide

### Prerequisites

- Node.js 16+
- MongoDB database
- Redis (for production)
- Email service (Gmail, Zoho, etc.)

### Option 1: Vercel Deployment (Recommended)

#### Frontend Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy Frontend**
```bash
cd website
vercel --prod
```

4. **Configure Environment Variables**
   - Set `REACT_APP_API_URL` to your backend URL

#### Backend Deployment

1. **Deploy Backend**
```bash
cd api-backend
vercel --prod
```

2. **Configure Environment Variables**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secure JWT secret
   - `GEMINI_API_KEY`: Your Gemini API key
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email app password
   - `REDIS_URL`: Your Redis connection string

### Option 2: Railway Deployment

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)

2. **Deploy Backend**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd api-backend
railway deploy
```

3. **Deploy Frontend**
```bash
cd website
railway deploy
```

### Option 3: Traditional VPS Deployment

#### Backend Setup

1. **Install Dependencies**
```bash
cd api-backend
npm install
```

2. **Create Environment File**
```bash
cp .env.example .env
# Edit .env with your values
```

3. **Start Backend**
```bash
npm start
```

#### Frontend Setup

1. **Install Dependencies**
```bash
cd website
npm install
```

2. **Build for Production**
```bash
npm run build
```

3. **Serve with Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/website/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
REACT_APP_ENV=production
```

### Backend (.env)
```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/astroai
JWT_SECRET=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_URL=redis://user:pass@host:port
```

## 📱 Mobile Optimization

The application is fully responsive and optimized for:
- Mobile phones
- Tablets
- Desktop computers

## 🔒 Security Features

- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Secure password hashing

## 📊 Database Schema

### Users Collection
```javascript
{
  email: String,
  password: String, // hashed
  profile: {
    name: String,
    date_of_birth: Date,
    place_of_birth: String,
    time_of_birth: String,
    gender: String,
    zodiac_sign: String,
    sun_sign: String,
    moon_sign: String
  },
  subscription: {
    plan: String, // 'free' | 'pro'
    expires_at: Date,
    stripe_customer_id: String
  }
}
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Astrology Services
- `POST /api/ai-chat` - AI chat consultation
- `POST /api/birth-chart` - Generate birth chart
- `POST /api/numerology` - Numerology analysis
- `GET /api/horoscope/:sign` - Get horoscope

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/subscription/upgrade` - Upgrade to Pro

## 🛠️ Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd astro-ai
```

2. **Install Dependencies**
```bash
# Backend
cd api-backend
npm install

# Frontend
cd ../website
npm install
```

3. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd api-backend
npm run dev

# Frontend (Terminal 2)
cd website
npm start
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions:
- Email: support@astroai.com
- Documentation: [docs.astroai.com](https://docs.astroai.com)

---

⭐ **Star this repository if it helped you!**
