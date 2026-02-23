# 🌊 JalDrushti — Integrated Drought Warning & Smart Tanker Management System

> **From Crisis Management to Preventive Water Governance**
>
> An AI-powered platform for the Vidarbha region of Maharashtra that predicts drought conditions, generates village-level Water Stress Indices, optimizes tanker dispatch, and provides real-time monitoring through a comprehensive admin dashboard.

---

## 🎯 Problem Statement

Design an integrated digital platform that:

1. **Predicts** emerging drought stress using rainfall deviation & groundwater trends
2. **Generates** a Village-Level Water Stress Index (WSI) using a weighted composite formula
3. **Estimates** future tanker demand with AI-powered prediction models
4. **Allocates** tankers based on priority scoring (population × severity × distance)
5. **Optimizes** tanker dispatch routes using OSRM routing engine
6. **Provides** a real-time monitoring dashboard with GIS mapping

The goal is to shift from *crisis management* to **preventive water governance**.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│  Landing Page · Admin Dashboard · Operator Dashboard │
│  React 18 + Vite · Leaflet Maps · Recharts          │
├─────────────────────────────────────────────────────┤
│                  INTELLIGENCE LAYER                  │
│  Gemini AI Analyst · WSI Engine · Demand Predictor   │
│  Route Optimizer (OSRM) · Priority Scoring           │
├─────────────────────────────────────────────────────┤
│                    DATA LAYER                        │
│  Firebase Auth · Cloud Firestore · OpenWeatherMap    │
│  35 Vidarbha Villages · 10 GPS-Tracked Tankers       │
├─────────────────────────────────────────────────────┤
│                   SERVICES LAYER                     │
│  Google Sign-In · Real-time Sync · Weather API       │
│  OSRM Routing API · Gemini 2.0 Flash                 │
└─────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, React Router v7 |
| **Styling** | Vanilla CSS (glassmorphism, dark theme, 15+ animations) |
| **Maps** | Leaflet.js + react-leaflet + CartoDB dark tiles |
| **Charts** | Recharts (line, bar, area, pie) |
| **Auth** | Firebase Authentication (Google Sign-In) |
| **Database** | Cloud Firestore (real-time sync) |
| **AI** | Google Gemini 2.0 Flash (chatbot + briefings) |
| **Weather** | OpenWeatherMap API (11 Vidarbha districts) |
| **Routing** | OSRM (Open Source Routing Machine) — free |
| **Icons** | Lucide React |
| **Fonts** | Inter + Outfit (Google Fonts) |

---

## 📊 Water Stress Index (WSI) Formula

```
WSI = (0.40 × RainfallDeviation) + (0.35 × GroundwaterDepletion) + (0.25 × PopulationDemand)
```

| Component | Weight | Calculation |
|-----------|--------|-------------|
| Rainfall Deviation | 40% | `((normal - actual) / normal) × 100 × 1.5` |
| Groundwater Depletion | 35% | `(depth / criticalDepth) × 60 + |trend| × 15` |
| Population Demand | 25% | `deficit_ratio × 70 + pop_factor × 30` |

**Risk Classification:**
| WSI Range | Level | Action |
|-----------|-------|--------|
| 0–30 | 🟢 Low | Monitor |
| 31–60 | 🟡 Moderate | Alert |
| 61–80 | 🟠 High | Deploy tankers |
| 81–100 | 🔴 Critical | Emergency response |

---

## 🚚 Priority Scoring Algorithm

```
PriorityScore = (0.55 × WSI) + (0.25 × PopulationFactor) + (0.20 × DistanceFactor)
```

Villages with higher scores receive tankers first. Route optimization uses OSRM to calculate actual road distances and travel times.

---

## 📁 Project Structure

```
AXION-CORP/
├── public/
│   └── vite.svg                    # Water droplet favicon
├── src/
│   ├── context/
│   │   └── AuthContext.jsx         # Firebase Auth + role management
│   ├── data/
│   │   └── vidarbhaData.js         # 35 villages, 10 tankers, charts data
│   ├── layouts/
│   │   ├── AdminLayout.jsx         # Sidebar navigation (8 pages)
│   │   └── OperatorLayout.jsx      # Mobile-friendly bottom nav
│   ├── pages/
│   │   ├── LandingPage.jsx/.css    # Animated landing with particles
│   │   ├── LoginPage.jsx/.css      # Google Sign-In + role selection
│   │   ├── admin/
│   │   │   ├── OverviewPage.jsx    # KPIs, Leaflet map, charts, AI briefing
│   │   │   ├── VillagesPage.jsx    # Searchable/filterable village table + map
│   │   │   ├── TankersPage.jsx     # GPS map, OSRM routing, priority queue
│   │   │   ├── AnalyticsPage.jsx   # Demand forecast, WSI comparison, budget
│   │   │   ├── AlertsPage.jsx      # Real-time alert feed + creation
│   │   │   ├── AIChatPage.jsx      # Gemini AI drought analyst chatbot
│   │   │   └── ScarcityPlanPage.jsx# 3-cycle action plan, WSI formula, protocol
│   │   └── operator/
│   │       ├── OperatorDashboard.jsx# Trip cards, active trip map, delivery flow
│   │       └── OperatorTrips.jsx   # GPS-verified history, payment tracking
│   ├── services/
│   │   ├── firebase.js             # Firebase init (Auth, Firestore)
│   │   ├── geminiService.js        # Gemini AI chatbot + daily briefings
│   │   ├── routeService.js         # OSRM routing + multi-stop TSP
│   │   └── weatherService.js       # OpenWeatherMap API integration
│   ├── utils/
│   │   ├── waterStressEngine.js    # WSI formula, drought hazard, demand predictor
│   │   └── seedFirestore.js        # Firestore data seeder
│   ├── App.jsx                     # Routing + protected routes
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global design system
├── .env                            # API keys (not committed)
├── .env.example                    # Template for API keys
├── index.html                      # SEO-optimized entry point
├── vite.config.js                  # Vite configuration
└── package.json                    # Dependencies
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Firebase project with Google Sign-In enabled
- Gemini API key (free from Google AI Studio)
- OpenWeatherMap API key (free tier)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/AXION-CORP.git
cd AXION-CORP
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your API keys:
```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Seed Firestore (First Time)
Login as Admin → Navigate to **Tankers** → Click **"Seed Firestore"** to populate the database with 35 villages and 10 tankers.

---

## 👥 User Roles

| Role | Access | Features |
|------|--------|----------|
| **District Authority (Admin)** | Full dashboard | Overview, Villages, Tankers, Analytics, Alerts, AI Chat, Scarcity Plan |
| **Tanker Operator** | Trip management | Assigned trips, GPS navigation, delivery status, trip history |

---

## 🤖 AI Integration (Gemini 2.0 Flash)

The AI Analyst is pre-loaded with:
- Real-time data from all 35 Vidarbha villages
- WSI scores, groundwater levels, rainfall deviations
- District-level statistics and tanker deployment status
- Maharashtra drought policy context

**Capabilities:**
- Village risk assessment and ranking
- Tanker demand prediction
- District-level comparisons
- Intervention recommendations
- Daily situation briefing generation

---

## 📈 Judging Criteria Alignment

| Criterion | How We Address It |
|-----------|------------------|
| **Understanding of Problem** | Deep research into Vidarbha drought — Paisewari system, SSMI data, 3-cycle scarcity framework |
| **Relevance to Vidarbha** | 35 real villages with GPS coordinates across all 11 districts, local rainfall/groundwater data |
| **Clarity of Solution** | Clean architecture, visible WSI formula, transparent priority scoring |
| **Technical Feasibility** | Production-grade stack — React + Firebase + Gemini + OSRM, all with free tiers |
| **Scalability** | Firestore scales automatically, stateless frontend, API-based architecture |
| **Social Impact** | Shifts governance from reactive to proactive, ensures equitable water distribution |

---

## 📄 License

MIT License — Built by Team AXION CORP

---
