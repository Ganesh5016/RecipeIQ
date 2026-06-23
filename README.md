# RecipeIQ – AI-Powered Personalized Recipe Recommendation System

> **Cook Smarter with AI** – A full-stack SaaS platform that generates personalized recipes using Groq AI, with meal planning, nutrition analysis, grocery management, and an AI chef chatbot.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | Firebase Authentication |
| AI | Groq API (llama3-8b-8192) |
| Images | Unsplash API, TheMealDB API |
| PDF | jsPDF |
| Charts | Recharts |
| Deployment | Frontend → Vercel, Backend → Render |

---

## 📁 Project Structure

```
recipeiq/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # ProtectedRoute, AdminRoute
│   │   │   ├── chat/        # ChatBot floating widget
│   │   │   ├── common/      # LoadingSpinner, Skeletons, StarRating
│   │   │   ├── layout/      # Navbar, Footer, DashboardLayout, PublicLayout
│   │   │   └── recipes/     # RecipeCard
│   │   ├── contexts/        # AuthContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register, ForgotPassword
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── recipes/     # List, Detail, Generate, IngredientMatch
│   │   │   ├── nutrition/   # Nutrition analyzer
│   │   │   ├── mealplan/    # Meal planner + calendar
│   │   │   ├── grocery/     # Grocery list + PDF export
│   │   │   ├── favorites/   # Saved recipes
│   │   │   ├── history/     # Activity history
│   │   │   ├── profile/     # User profile editor
│   │   │   └── admin/       # Dashboard, Users, Recipes, Reviews
│   │   ├── services/        # api.js (Axios), firebase.js
│   │   └── App.jsx
│   └── package.json
│
└── server/                  # Express backend
    ├── config/              # database.js, firebase.js, groq.js
    ├── controllers/         # authController, recipeController, etc.
    ├── middleware/          # auth.js, errorHandler.js, validation.js
    ├── models/              # User, Recipe, Favorite, Review, MealPlan, etc.
    ├── routes/              # All REST API routes
    └── index.js
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Groq API key (free at console.groq.com)
- Unsplash developer account

---

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/yourname/recipeiq.git
cd recipeiq

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Go to **Project Settings** → **Service Accounts** → Generate new private key
5. Note your `projectId`, `clientEmail`, and `privateKey`
6. Go to **Project Settings** → **General** → copy web app config

---

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Allow your IP (or 0.0.0.0/0 for all)
5. Copy your connection string

---

### 4. Groq API Setup

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free account
3. Generate an API key

---

### 5. Unsplash API Setup

1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key

---

### 6. Environment Variables

#### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipeiq

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

GROQ_API_KEY=gsk_your_groq_api_key

UNSPLASH_ACCESS_KEY=your_unsplash_access_key

ADMIN_UID=firebase_uid_of_your_admin_account

FRONTEND_URL=http://localhost:5173
```

#### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

---

### 7. Run Locally

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Visit: `http://localhost:5173`

---

### 8. Set Admin Account

1. Register an account normally on the app
2. In Firebase Console → Authentication, copy the UID of your account
3. Add that UID to `ADMIN_UID` in your server `.env`
4. Restart the server
5. Log out and log back in — your account will now have `admin` role

---

## 🏗️ Build for Production

```bash
# Build frontend
cd client
npm run build
# Output: client/dist/

# Backend runs as-is with Node.js
```

---

## 🚀 Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set **Root Directory** to `client`
4. Add all `VITE_*` environment variables in Vercel dashboard
5. Deploy

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add all server environment variables
7. Deploy

### After deployment:
- Update `FRONTEND_URL` in Render env to your Vercel URL
- Update `VITE_API_URL` in Vercel env to your Render URL + `/api`
- Update Firebase Authorized Domains with your Vercel domain

---

## 🔐 Security Features

- Firebase token verification on every protected route
- Helmet.js for secure HTTP headers
- express-rate-limit to prevent abuse
- express-mongo-sanitize against NoSQL injection
- Joi input validation on all endpoints
- Environment variables for all secrets
- Role-based access control (user/admin)

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| AI Recipe Generator | Groq-powered recipe creation from ingredients |
| Ingredient Matching | Smart matching with % compatibility scores |
| AI Chef Chatbot | Floating chat widget powered by Groq |
| Nutrition Analyzer | AI nutritional breakdown with Recharts charts |
| Meal Planner | AI-generated weekly/monthly meal plans with calendar view |
| Grocery Manager | Smart lists with category grouping & PDF export |
| Favorites | Save, organize, and manage recipe collections |
| Reviews | Star ratings and comments on every recipe |
| Admin Panel | Full user, recipe, and review management |
| Analytics | Real-time platform stats with charts |
| Dark Mode | System/light/dark theme with persistence |

---

## 📊 MongoDB Collections

- `users` — Profile, preferences, roles
- `recipes` — AI-generated and MealDB recipes
- `favorites` — User's saved recipes
- `reviews` — Ratings and comments
- `mealplans` — Daily/weekly/monthly plans with calendar data
- `grocerylists` — Shopping lists with category grouping
- `chatmessages` — AI chef conversation history
- `recommendationhistories` — Activity and generation history

---

## 🤝 API Endpoints

```
POST   /api/auth/register
GET    /api/auth/me
POST   /api/recommendations/generate
POST   /api/recommendations/match-ingredients
POST   /api/recommendations/analyze-nutrition
POST   /api/recommendations/meal-plan-ai
POST   /api/chat/message
GET    /api/recipes
GET    /api/recipes/trending
GET    /api/recipes/:id
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:recipeId
GET    /api/reviews/:recipeId
POST   /api/reviews/:recipeId
GET    /api/mealplans
POST   /api/mealplans
GET    /api/grocerylists
POST   /api/grocerylists
GET    /api/analytics/public
GET    /api/analytics/admin   (admin only)
GET    /api/admin/users       (admin only)
```

---

## 📄 License

MIT © RecipeIQ 2024
