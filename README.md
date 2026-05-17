# 🐘 ELEPHANT  
### AI-Augmented Goal Setting & Performance Intelligence Platform

ELEPHANT is a modern enterprise-grade performance management platform powered by AI, behavioral analytics, and intelligent workflow systems.

Built with:
- ⚡ Next.js 14
- 🚀 FastAPI
- 🐘 PostgreSQL (Neon)
- 🔐 JWT Authentication
- 🎨 Tailwind CSS
- ☁️ Vercel + Render Deployment

---

# ✨ Features

## 🔐 Authentication & Security
- JWT Authentication
- Refresh Token System
- Protected Routes
- Role-Based Access
- Secure API Architecture

---

## 🎯 Goal Management
- Goal Sheet Creation
- Smart Goal Tracking
- Weightage Distribution
- KPI Monitoring
- Goal Progress Analytics

---

## 📊 Analytics & Intelligence
- AI-Augmented Insights
- Performance Intelligence
- Behavioral Analytics
- Team Performance Tracking
- Productivity Metrics
- Strategic Reporting

---

## 👥 Enterprise Workflow
- Admin Dashboard
- Manager Dashboard
- Team Collaboration
- Notifications System
- Audit & Tracking
- Check-In Management

---

# 🏗️ Tech Stack

| Frontend | Backend | Database | Deployment |
|---|---|---|---|
| Next.js 14 | FastAPI | PostgreSQL | Vercel |
| TypeScript | Python | NeonDB | Render |
| Tailwind CSS | SQLAlchemy | Alembic | GitHub Actions |

---

# 📁 Project Structure

```bash
ELEPHANT/
│
├── backend/               # FastAPI Backend
│   ├── app/
│   ├── alembic/
│   └── requirements.txt
│
├── src/                   # Next.js Frontend
├── public/
├── package.json
├── next.config.mjs
└── README.md
```

---

# 🚀 Live Deployment

## Frontend
👉 https://atom-elephant.vercel.app

## Backend API Docs
👉 https://elephant-backend-fsyw.onrender.com/docs

---

# ⚙️ Local Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/pratham9766/ATOM-ELEPHANT.git
cd ATOM-ELEPHANT
```

---

# 🖥️ Frontend Setup

## Install Dependencies

```bash
npm install
```

## Create `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# ⚙️ Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create `.env`

```env
DATABASE_URL=YOUR_DATABASE_URL
SYNC_DATABASE_URL=YOUR_SYNC_DATABASE_URL

JWT_SECRET=your_secret
JWT_ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=43200
```

---

## Run Migrations

```bash
alembic upgrade head
```

---

## Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```bash
http://127.0.0.1:8000
```

---

# 🌐 Production Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

---

# 📸 Screenshots

> Add screenshots of:
- Login Page
- Dashboard
- Analytics
- Goal Sheets
- Admin Panel

---

# 🔥 Future Roadmap

- AI Goal Recommendation Engine
- Team Sentiment Analysis
- Voice Assistant Integration
- Real-Time Collaboration
- Predictive Performance Modeling
- Mobile App
- Advanced AI Analytics

---

# 🤝 Contributing

Contributions are welcome!

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Open Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

### Pratham Bokefode

- GitHub: https://github.com/pratham9766
- LinkedIn: Add your LinkedIn
- Portfolio: Add portfolio link

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
🚀 Share it with others

---

# 🐘 ELEPHANT

> “Intelligence. Memory. Leadership. Performance.”
