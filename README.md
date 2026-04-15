# 💸 AI Expense Tracker

A full-stack, AI-powered personal finance management application that helps users track expenses, analyze spending patterns, get personalized budget suggestions, chat with an AI financial advisor, set saving goals, and scan bills — all in one place.

---

## 🚀 Live Demo

🔗 [https://expense-tracker-dhanabalan.netlify.app](https://expense-tracker-dhanabalan.netlify.app)

---

## 📸 Screenshots

### 🏠 Dashboard
<img width="1588" alt="Dashboard" src="https://github.com/user-attachments/assets/d1926339-d68a-4e0e-a672-028b8c22242c" />

### 💰 Expenses
<img width="1920" alt="Expenses" src="https://github.com/user-attachments/assets/6b0beb93-140a-409f-a761-5fd62203632a" />

### 🤖 AI Insights — Monthly Insights
<img width="1920" alt="AI Insights - Monthly" src="https://github.com/user-attachments/assets/cf638233-f57a-4b0a-9ccb-58d1df5f1d51" />

### 🤖 AI Insights — Budget Suggestions
<img width="1920" alt="AI Insights - Budget" src="https://github.com/user-attachments/assets/6e4fa993-ed57-4dad-b4bd-f391fdc031a0" />

### 🤖 AI Insights — Anomaly Detection
<img width="1920" alt="AI Insights - Anomaly" src="https://github.com/user-attachments/assets/248a5996-5c50-4274-85d2-a733d1797fcb" />

### 💬 Chat
<img width="1920" alt="Chat" src="https://github.com/user-attachments/assets/360beeb9-4896-4964-928f-d26e40c0029a" />

### 🎯 Goals
<img width="1920" alt="Goals" src="https://github.com/user-attachments/assets/df3778bb-e2de-493a-a0f7-e4df4b1f0330" />

### 🔐 Login
<img width="1920" alt="Login" src="https://github.com/user-attachments/assets/6828106f-6556-4ff6-8a08-d2ab0f731446" />

### 📝 Register
<img width="1920" alt="Register" src="https://github.com/user-attachments/assets/a395e7f3-213f-4292-965a-2125e9f8d686" />

### 👤 Profile
<img width="1920" alt="Profile" src="https://github.com/user-attachments/assets/90a95989-a92e-46bb-a6bd-cc2348429b40" />

---

## 🧠 What This App Does

- Track and manage your daily expenses with categories, dates, and notes
- Get **AI-generated financial insights**, budget suggestions, and anomaly detection powered by Groq LLaMA
- Chat with an **AI financial advisor** that knows your expense data and saving goals
- **Smart alerts** — real-time warnings for overspending, negative balance, and high category spend
- **Predict future expenses** — AI forecasts next month's spending based on past data
- **Goal-based saving** — set financial goals, track progress, and celebrate completions
- **Bill scanner** — upload a receipt image and AI auto-fills the expense form
- Visualize spending with **charts, trends, and progress bars**
- **Download PDF report** — full expense report with summary, category breakdown, and transactions
- Fully responsive — works seamlessly on **mobile and desktop**

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Bootstrap 5** | Layout & utility classes |
| **Recharts** | Charts & data visualization |
| **React Icons** | Icon library |
| **React Hot Toast** | Toast notifications |
| **Axios** | HTTP client for API calls |
| **jsPDF + AutoTable** | PDF report generation |
| **CSS (custom)** | Component-level styling |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Groq SDK** | AI/LLM integration (LLaMA + Vision) |
| **dotenv** | Environment variable management |
| **CORS** | Cross-origin resource sharing |
| **Nodemon** | Dev server auto-restart |

### Package Manager
- **pnpm** with workspaces (monorepo structure)

---

## ✨ Features

### 🔐 Authentication
- User registration & login with JWT
- Secure password hashing with bcrypt
- Protected routes — all pages require authentication
- Persistent login via token stored in localStorage
- **Mandatory income setup** after registration — required for accurate balance calculation
- Profile update (name, email, password, monthly income)

### 💰 Expense Management
- Add, edit, delete expenses with title, amount, category, date, and note
- **Delete confirmation toast** — prevents accidental data loss
- **8 categories** — Food, Transport, Shopping, Bills, Health, Education, Entertainment, Other
- Search expenses by title
- Filter by category and date range (Today, This Week, This Month, Last Month, Custom)
- Pagination with "Load More"
- **Export to CSV** — download filtered expenses
- **⚡ AI Auto-Categorize** — type a title and AI suggests the right category
- **📷 Bill Scanner** — upload receipt image → AI auto-fills title, amount, category, note

### 📊 Dashboard
- Monthly income, total spent, balance, and transaction count summary cards
- **⚠️ Smart Alerts** — real-time banners for:
  - Budget exceeded (80% / 100%)
  - Overspending on a category (>30% of income)
  - This month spending 50%+ higher than last month
  - Negative balance warning
- **Monthly budget progress bar** with color-coded status
- **This Month vs Last Month** comparison with percentage change
- **6-Month Spending Trend** custom bar chart
- **Top 3 Spending Categories** with animated progress bars
- **AI Insights quick card** — shortcut to AI Insights page
- **Saving Goals quick card** — shows goal progress at a glance
- **🔮 Predict Next Month** — AI-powered spending forecast widget
- Recent transactions list
- **Download PDF Report** — full report with summary, categories, and all transactions

### 🤖 AI Insights (Powered by Groq LLaMA)
- **Monthly Insights** — spending pattern analysis including goal progress
- **Budget Suggestions** — AI-recommended allocations factoring in saving goals
- **Anomaly Detection** — unusual spending patterns and goal impact analysis
- Per-card refresh button to regenerate individually
- Skeleton loading animation while fetching

### 💬 AI Financial Advisor Chat
- Real-time chat with an AI advisor that knows your expenses AND saving goals
- Ask financial questions like "Can I afford a bike?" or "How much can I save monthly?"
- **Chat session history** — create, switch, and delete sessions
- Session titles auto-generated from conversation
- **Voice input** — speak your question using Web Speech API
- **Dark mode** toggle
- Suggestion cards for quick financial questions
- Typing indicator animation
- **Mobile sidebar** — slide-in overlay with History button

### 🎯 Goal-Based Saving
- Create saving goals with title, target amount, emoji, and optional deadline
- Track progress with animated progress bars
- **Add Savings** — log money saved towards each goal
- Color-coded progress (blue → yellow → green as you approach target)
- **Completion celebration** — toast notification when goal is reached
- Goals integrated into AI insights and budget suggestions

### 👤 Profile
- View and update name, email, monthly income, and password
- Monthly income used for balance calculation and AI analysis

### 📱 Mobile Responsive
- Fully optimized for all screen sizes
- Mobile-specific bottom sheet modals for category, date range, and date picker
- Slide-in chat sidebar with backdrop overlay
- Responsive grid layouts for dashboard and goals

---

## 📁 Project Structure

```
AI Task/
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       │   ├── Charts/         # Recharts visualizations
│       │   ├── EmptyState/     # Empty state UI
│       │   ├── ExpenseCard/    # Expense list item
│       │   ├── ExpenseDetail/  # Expense detail modal
│       │   ├── ExpenseForm/    # Add/edit expense form (with AI + Bill Scanner)
│       │   ├── IncomeSetup/    # Mandatory income setup modal
│       │   ├── Loading/        # Loading spinner
│       │   ├── Navbar/         # Top navigation
│       │   └── Skeleton/       # Loading skeletons
│       ├── context/
│       │   ├── AuthContext     # Auth state & JWT
│       │   └── ExpenseContext  # Expenses & summary state
│       ├── pages/
│       │   ├── AIInsights/     # AI-powered insights page
│       │   ├── Chat/           # AI financial advisor chat
│       │   ├── Dashboard/      # Main dashboard
│       │   ├── Expenses/       # Expense management
│       │   ├── Goals/          # Goal-based saving page
│       │   ├── Login/          # Login page
│       │   ├── Profile/        # User profile
│       │   └── Register/       # Register page
│       └── utils/
│           ├── api.js          # Axios instance
│           └── generateReport.js # PDF report generator
│
└── server/                     # Express backend
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── env.js              # Dotenv loader
    ├── controllers/
    │   ├── aiController.js     # All AI endpoints
    │   ├── authController.js   # Register, login, profile
    │   ├── expenseController.js# CRUD expenses
    │   └── goalController.js   # Goal CRUD + savings
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification
    ├── models/
    │   ├── Expense.js          # Expense schema
    │   ├── Goal.js             # Goal schema
    │   └── User.js             # User schema
    ├── routes/
    │   ├── aiRoutes.js         # AI endpoints
    │   ├── authRoutes.js       # Auth endpoints
    │   ├── expenseRoutes.js    # Expense endpoints
    │   └── goalRoutes.js       # Goal endpoints
    └── services/
        └── groqaiService.js    # Groq AI service layer
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile & income |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/expenses/summary` | Get spending summary |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/categorize` | Auto-categorize expense title |
| GET | `/api/ai/insights` | Monthly spending insights |
| GET | `/api/ai/budget-suggestions` | Budget recommendations |
| POST | `/api/ai/chat` | AI financial advisor chat |
| GET | `/api/ai/anomalies` | Anomaly detection |
| GET | `/api/ai/predict` | Predict next month expenses |
| POST | `/api/ai/scan-bill` | Scan receipt image |

### Goals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create new goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| POST | `/api/goals/:id/save` | Add savings to goal |

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- MongoDB Atlas account
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-expense-tracker.git
cd ai-expense-tracker

# Install all dependencies
pnpm install

# Start both client and server
pnpm dev
```

Or run separately:

```bash
# Start backend
cd server && pnpm dev

# Start frontend
cd client && pnpm dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

---

## 🚢 Deployment

| Service | Purpose |
|---|---|
| **Netlify** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database hosting |

---

## 🎯 Key Highlights for Recruiters

- **Full-stack MERN application** built from scratch
- **AI/LLM integration** using Groq's LLaMA model for real financial analysis
- **Vision AI** using `meta-llama/llama-4-scout-17b-16e-instruct` for bill scanning (OCR)
- **JWT authentication** with secure password hashing
- **RESTful API** design with proper separation of concerns
- **Context API** for global state management (no Redux needed)
- **Responsive design** — mobile-first approach with Bootstrap + custom CSS
- **Real-time voice input** using Web Speech API
- **Data visualization** with Recharts
- **PDF report generation** with jsPDF + AutoTable
- **Smart alerts** — proactive financial warnings based on spending patterns
- **Goal-based saving** — full CRUD with progress tracking
- **Clean code architecture** — controllers, services, models, routes separation
- **Monorepo** structure with pnpm workspaces

---

## 👨💻 Author

**Hemapathi**
Built with ❤️ using React, Node.js, MongoDB & Groq AI
