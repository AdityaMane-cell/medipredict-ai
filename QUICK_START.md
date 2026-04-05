# Quick Start Guide - Health AI Project

## 🚀 Getting Started

### Prerequisites

- Python 3.8+ with venv
- Node.js 16+
- Windows PowerShell or terminal

### Option 1: Quick Start (Recommended)

#### Terminal 1 - Start Backend

```powershell
cd f:\EPIC\CODING\Projects\health-ai-project

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start uvicorn server
python -m uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Start Frontend

```powershell
cd f:\EPIC\CODING\Projects\health-ai-project\web

# Start Vite dev server
npm run dev
```

#### Open Browser

- Visit: `http://localhost:5174` (or whatever port Vite shows)

---

## 🎯 Using the App

### Home Page (Welcome Screen)

- **Two Options**:
  1. **Continue as Guest** → Use predictions without account (no history saved)
  2. **Login / Sign Up** → Create account to save history

### Guest Mode

- Make predictions freely
- No account needed
- History not saved
- Can login anytime from header

### Create Account

1. Click "Login / Sign Up"
2. Click "Sign Up" tab
3. Enter username, email, password
4. Click "Create Account"
5. Auto-logged in ✅

### Login

1. Click "Login / Sign Up"
2. (Login tab already selected)
3. Enter username and password
4. Click "Sign In"
5. Logged in ✅

### Making Predictions

#### Method 1: Symptom Picker

1. Click "Symptom Picker" tab
2. Click symptoms from suggested list or type your own
3. Click "+ Add" to add custom symptoms
4. Click "Predict from Symptoms"
5. See results with confidence scores

#### Method 2: Natural Language

1. Click "Natural Language" tab
2. Type description: "I have fever, headache, and cough"
3. Click "Predict from Text"
4. See results

### View History (Logged-in Only)

- Sidebar on left (if logged in)
- "History" tab shows all past predictions
- "Profile" tab shows account info
- Logout button available

---

## ⚙️ Configuration

### Backend API

- **URL**: `http://localhost:8000`
- **Database**: SQLite (`healthai.db` in project root)
- **Endpoints**:
  - `POST /register` - Create account
  - `POST /token` - Login
  - `GET /me` - Get current user
  - `POST /predict` - Predict from symptoms
  - `POST /predict-text` - Predict from text
  - `GET /symptoms` - Get available symptoms
  - `GET /history` - Get prediction history

### Frontend Environment

- **File**: `web/.env.local`
- **Content**: `VITE_API_BASE_URL=http://localhost:8000`
- **Note**: Already configured for local development

---

## 🎨 Design Features

### Modern UI Theme

- **Gradient Background**: Purple to Violet
- **Glassmorphic Cards**: Blur effect with transparency
- **Smooth Animations**: Fade-in, hover effects, transitions
- **Responsive Design**: Works on desktop, tablet, mobile
- **Color Coded**: Green (success), Red (errors), Blue (info)

### User Feedback

- **Toast Notifications**: Bottom right corner
- **Error Messages**: Red with animation
- **Success Messages**: Green with icon
- **Loading States**: "Running..." text while processing
- **Hover Effects**: Cards lift, buttons glow

---

## 🔍 Troubleshooting

### Frontend Won't Load

- Check if port 5174 is in use
- Try killing existing Node processes
- Clear browser cache
- Check console for errors (F12)

### Backend Won't Start

- Ensure venv is activated
- Run: `pip install -r requirements.txt`
- Check if port 8000 is in use
- Try: `netstat -ano | findstr :8000` to find process

### Predictions Not Working

- Ensure backend is running
- Check if `.env.local` has correct API URL
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for network errors

### Database Issues

- Delete `healthai.db` file
- Backend will recreate it on next run
- Tables auto-create from models

### CSS Not Updating

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Restart Vite dev server
- Check for CSS syntax errors

---

## 📦 Project Structure

```
health-ai-project/
├── api/                 # Backend (FastAPI)
│   ├── app.py          # Main application
│   ├── auth.py         # Authentication logic
│   ├── db.py           # Database config
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic schemas
│   ├── routes/         # API routes
│   └── services/       # Business logic
├── web/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx     # Main component
│   │   ├── App.css     # Styles
│   │   └── main.jsx    # Entry point
│   ├── .env.local      # Environment (backend URL)
│   ├── package.json    # Dependencies
│   └── vite.config.js  # Vite config
├── ml/                  # ML models
│   ├── models/         # Trained models
│   ├── notebooks/      # Jupyter notebooks
│   └── src/            # ML scripts
├── tests/              # Test files
└── README.md           # Main documentation
```

---

## 💡 Tips

### Save Time

- Backend and frontend both support hot reload
- Edit code → Changes appear automatically
- No need to restart servers (usually)

### Debug Frontend

- Press F12 to open developer console
- Check Network tab for API calls
- Check Console for JavaScript errors

### Debug Backend

- Uvicorn logs appear in terminal
- SQLite database stored as file
- Check Console tab for Python errors

### Deploy Later

- Use Docker: Already have `Dockerfile`
- Update `.env` for production
- Use proper database (PostgreSQL)
- Add HTTPS/SSL

---

## 🆘 Need Help?

1. **Check UI_UX_FIXES_SUMMARY.md** - Detailed changes
2. **Check README.md** - Project overview
3. **Check error messages** - Usually very descriptive
4. **Check browser console** - Frontend errors logged there
5. **Check terminal** - Backend errors logged there

---

## ✅ What's Working

- ✅ User authentication (signup/login)
- ✅ Guest mode navigation
- ✅ Symptom prediction
- ✅ Text-based prediction
- ✅ Prediction history (logged-in users)
- ✅ Modern responsive UI
- ✅ Toast notifications
- ✅ Error handling
- ✅ Glassmorphic design
- ✅ Smooth animations

---

**Happy predicting! 🏥**
