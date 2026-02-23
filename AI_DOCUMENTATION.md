# AI Usage Documentation — JalDrushti
### Integrated Drought Warning & Smart Tanker Management System
**Team: AXION CORP**
**Date: February 23, 2026**

---

## 1. AI Tools Used

| # | AI Tool | Version | Purpose | Integration Type |
|---|---------|---------|---------|-----------------|
| 1 | **Google Gemini 2.0 Flash** | `gemini-2.0-flash` | In-app AI drought analyst chatbot + daily briefing generation | Embedded in application via `@google/generative-ai` SDK |
| 2 | **Gemini (via AI Coding Assistant)** | — | Development assistance — code generation, debugging, architecture planning | Used during development only |

> **Note:** Gemini 2.0 Flash is integrated into the final application as a core feature (AI Drought Analyst). The AI coding assistant was used during development to accelerate coding.

---

## 2. Development Process — AI-Assisted Workflow

Below is a chronological account of how AI was used during development, what we prompted, what the AI suggested, and what we actually implemented.

---

### Phase 1: Project Architecture & Setup

**What we needed:** A full-stack architecture for a drought management system with real-time data, AI analysis, and route optimization.

**Prompt to AI:**
> *"Build an AI-powered drought warning and smart tanker management system for the Vidarbha region. It should have a landing page, admin dashboard with maps, village monitoring, tanker tracking, analytics, alerts, and an AI chatbot. Use React + Vite + Firebase."*

**What AI suggested:**
- React 18 with Vite for fast development
- Firebase Authentication with Google Sign-In for real auth
- Cloud Firestore for real-time database
- Leaflet.js with CartoDB dark tiles for GIS mapping
- Recharts for data visualization
- Gemini 2.0 Flash for AI-powered drought analysis
- OSRM (Open Source Routing Machine) for route optimization
- Role-based access control (Admin vs Operator)

**What we did:**
- We accepted and implemented the full suggested architecture
- We chose a dark glassmorphism theme for visual impact
- We added Vidarbha-specific village data based on our own research (GPS coordinates, rainfall normals from IMD, groundwater data from GSDA reports)
- We structured the project with clear separation: `/pages`, `/services`, `/utils`, `/context`, `/data`

**Files created:** `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

---

### Phase 2: Village Data & WSI Formula

**What we needed:** A scientifically grounded Water Stress Index formula.

**Prompt to AI:**
> *"Create a Water Stress Index calculation engine for drought assessment. It should use rainfall deviation, groundwater depletion, and population demand as inputs. Include the mathematical formula and risk classification."*

**What AI suggested:**
- A weighted composite formula: `WSI = (0.40 × RainfallDeviation) + (0.35 × GroundwaterDepletion) + (0.25 × PopulationDemand)`
- Sub-score calculations for each component
- Risk classification: 0-30 Low, 31-60 Moderate, 61-80 High, 81-100 Critical
- Priority scoring algorithm for tanker allocation
- Drought hazard function based on SSMI research paper methodology

**What we did:**
- We implemented the AI-suggested formula as-is in `src/utils/waterStressEngine.js`
- We added our own Vidarbha contextual data — 35 real villages with GPS coordinates sourced from Google Maps, population estimates from Census data, and rainfall normals from IMD Nagpur division records
- We validated the formula outputs against known drought-affected villages (Pusad, Malegaon, Chandur Bazar) and confirmed WSI > 80 for historically drought-prone areas
- We added the Drought Hazard Score function from SSMI research: `H = (D × M × I) / N`

**Files created:** `src/utils/waterStressEngine.js`, `src/data/vidarbhaData.js`

**AI-generated output used:**
```javascript
// WSI Calculation Formula (AI-suggested, implemented as-is)
export function calculateWSI({ actualRainfall, normalRainfall, groundwaterDepth, groundwaterTrend, population, waterAvailableLPCD }) {
  const rainfallScore = calcRainfallDeviation(actualRainfall, normalRainfall);
  const groundwaterScore = calcGroundwaterDepletion(groundwaterDepth, groundwaterTrend);
  const populationScore = calcPopulationDemand(population, waterAvailableLPCD);
  const wsi = Math.round(
    (0.40 * rainfallScore) + (0.35 * groundwaterScore) + (0.25 * populationScore)
  );
  return { wsi, riskLevel, breakdown };
}
```

---

### Phase 3: Landing Page Design

**What we needed:** A visually stunning landing page that makes a strong first impression.

**Prompt to AI:**
> *"Create an animated landing page with particle effects, scroll-triggered animations, glassmorphism cards, and a dark premium theme. Include sections for Hero, Problem, Solution, Features, Impact, and CTA."*

**What AI suggested:**
- Canvas-based particle animation system with floating water droplet-like particles
- CSS-based scroll-reveal animations using Intersection Observer API
- Glassmorphism card design with `backdrop-filter: blur()`
- Count-up animations for statistics (35 villages, 11 districts, etc.)
- A vibrant color palette with cyan, purple, and orange accents

**What we did:**
- We implemented the particle system and scroll animations as suggested
- We wrote the actual content — all problem statement text, solution descriptions, and impact metrics are from our research on Vidarbha's drought crisis
- We added the real statistics: 47% non-functional KT Weirs, 398.87 million m³ water diversion data — sourced from GSDA and government reports
- We customized the color scheme to match a water/drought theme

**Files created:** `src/pages/LandingPage.jsx`, `src/pages/LandingPage.css`

---

### Phase 4: Authentication System

**What we needed:** Secure login with role-based access control.

**Prompt to AI:**
> *"Set up Firebase Authentication with Google Sign-In. After login, users should select their role (Admin or Operator). Store the role in Firestore. Add protected routes."*

**What AI suggested:**
- Firebase Auth with `signInWithPopup` for Google Sign-In
- Role storage in Firestore `users` collection
- React Context (`AuthContext`) for global auth state
- Protected route component that checks role before rendering
- Fallback to localStorage if Firestore is temporarily unavailable

**What we did:**
- We implemented the auth flow exactly as suggested
- We created a real Firebase project (`jaldrushti`) and configured Google Sign-In
- We added our own demo login mode so evaluators can test without needing a Google account
- We set up Firestore security rules for production use

**Files created:** `src/services/firebase.js`, `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/LoginPage.css`

---

### Phase 5: Admin Dashboard Pages

**What we needed:** A comprehensive 8-page admin dashboard.

**Prompts to AI (multiple):**
> *"Create an admin overview page with KPI cards, a Leaflet map showing village risk levels, risk distribution chart, AI daily briefing panel, and rainfall/groundwater trend charts."*

> *"Build a villages page with a searchable, filterable, sortable table. Include a map view toggle. Show risk badges and rainfall deviation."*

> *"Create a tankers management page with live GPS map, priority allocation queue with scoring formula, and fleet status table."*

> *"Build an analytics page with demand prediction chart, district WSI comparison, year-over-year rainfall, and budget utilization."*

> *"Create an alerts page with a filterable real-time alert feed and alert creation form."*

**What AI suggested for each page:**
- Component structure, state management, chart configurations
- Leaflet map integration with CircleMarkers and Popups
- Recharts chart layouts (Area, Bar, Line, Pie)
- Responsive grid layouts

**What we did:**
- We implemented each page using AI-suggested component structures
- We customized all data to use our Vidarbha village dataset
- We added contextual details: specific village names, taluka names, district names
- We created the alert content ourselves based on real Vidarbha drought scenarios
- We added the live weather integration using our OpenWeatherMap API key
- For the Tankers page, we integrated OSRM route optimization (our addition based on problem statement gap analysis)

**Files created:**
- `src/pages/admin/OverviewPage.jsx`
- `src/pages/admin/VillagesPage.jsx`
- `src/pages/admin/TankersPage.jsx`
- `src/pages/admin/AnalyticsPage.jsx`
- `src/pages/admin/AlertsPage.jsx`
- `src/pages/admin/AIChatPage.jsx`
- `src/pages/admin/ScarcityPlanPage.jsx`
- `src/layouts/AdminLayout.jsx`

---

### Phase 6: Route Optimization Service

**What we needed:** Actual road routing for tanker dispatch, not just straight-line distances.

**Prompt to AI:**
> *"Create a route optimization service using OSRM. It should calculate single routes and also solve the Traveling Salesman Problem for multi-stop delivery. Include a Haversine fallback."*

**What AI suggested:**
- OSRM public demo server API integration
- Single-route function with distance, duration, and GeoJSON geometry
- Multi-stop TSP solver using OSRM's `/trip` endpoint
- Haversine distance fallback for when OSRM is unavailable
- Coordinate transformation for Leaflet compatibility

**What we did:**
- We implemented the OSRM integration as suggested
- We added the Nagpur Water Depot as the central dispatch hub (coordinates from our research)
- We integrated route polylines into the Tankers page map
- We connected it to the priority allocation queue — clicking "Route" calculates the actual road path

**Files created:** `src/services/routeService.js`

**AI-generated output used:**
```javascript
// OSRM Route Fetching (AI-suggested implementation)
export async function getRoute(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    distance: (data.routes[0].distance / 1000).toFixed(1),
    duration: Math.round(data.routes[0].duration / 60),
    geometry: data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]),
  };
}
```

---

### Phase 7: AI Analyst Integration (In-App Feature)

**What we needed:** An AI chatbot embedded in the app that can analyze Vidarbha drought data.

**Prompt to AI:**
> *"Build a Gemini AI integration that receives the full 35-village database in its system prompt. It should be able to analyze specific villages, compare districts, predict demand, and give actionable recommendations. Add quick action buttons and markdown rendering."*

**What AI suggested:**
- Rich system prompt containing all village data as structured text
- Chat history management for multi-turn conversations
- 6 quick action buttons for common queries
- Simple markdown-to-HTML renderer for formatted AI responses
- Fallback responses that use the local data if Gemini API is unavailable

**What we did:**
- We implemented the Gemini integration using `@google/generative-ai` SDK
- We injected ALL 35 villages with their full data (WSI, rainfall, groundwater, population, tankers) into the system prompt
- We added the 9-step contingency protocol from Maharashtra Drought Manual as context
- We configured `temperature: 0.7` and `maxOutputTokens: 2048` for balanced, detailed responses
- We created our own fallback responses for per-village and per-district analysis
- We added the daily briefing generation feature for the Overview page

**Files created:** `src/services/geminiService.js`, `src/pages/admin/AIChatPage.jsx`

> **Important:** The AI Analyst is a **core feature of the application**, not just a development tool. It allows district authorities to interact with drought data using natural language.

---

### Phase 8: Scarcity Action Plan & Operator Dashboard

**Prompt to AI:**
> *"Create a Scarcity Action Plan page showing Maharashtra's 3-cycle drought framework, the 9-step contingency protocol, live WSI formula breakdown, and district budget tracking."*

> *"Build a Tanker Operator dashboard with assigned trip cards, active trip map, start/deliver workflow, and trip history with GPS verification."*

**What AI suggested:**
- 3-cycle timeline cards with status indicators
- WSI formula visualization with progress bars for each component
- 9-step contingency list from the Maharashtra Drought Manual
- District budget table with utilization progress bars
- Mobile-friendly operator layout with bottom navigation

**What we did:**
- We implemented both pages as suggested
- We researched and added the actual content for the 9-step protocol:
  1. Deepening of existing wells
  2. Repair of existing water supply schemes
  3. Installation of temporary pipelines
  4. Acquisition of private wells (within 1km)
  5. Construction of temporary Doha structures
  6. New borewell drilling
  7. Bulk water transport from surplus areas
  8. Diversion of water from irrigation sources
  9. Water tanker deployment (LAST RESORT)
- We added realistic budget figures based on government allocation data

**Files created:** `src/pages/admin/ScarcityPlanPage.jsx`, `src/pages/operator/OperatorDashboard.jsx`, `src/pages/operator/OperatorTrips.jsx`, `src/layouts/OperatorLayout.jsx`

---

### Phase 9: Firestore Integration & Data Seeding

**Prompt to AI:**
> *"Create a Firestore seeding utility that pushes all 35 villages and 10 tankers to the database, plus CRUD functions for real-time data access and trip logging."*

**What AI suggested:**
- Batch write for efficient Firestore seeding
- Functions: `seedFirestore()`, `getVillagesFromFirestore()`, `getTankersFromFirestore()`, `updateTankerStatus()`, `logTrip()`
- Timestamp tracking for all records

**What we did:**
- We implemented the seeding utility as suggested
- We added a "Seed Firestore" button in the Tankers page for easy database population
- We configured our real Firebase project (`jaldrushti`) with the proper credentials

**Files created:** `src/utils/seedFirestore.js`

---

## 3. Summary of AI Contributions vs Team Contributions

| Aspect | AI Contribution | Team AXION CORP Contribution |
|--------|----------------|------------------------------|
| **Architecture** | Suggested tech stack and project structure | Finalized stack, set up Firebase project, configured APIs |
| **WSI Formula** | Generated the weighted formula and sub-score functions | Validated against real Vidarbha drought data, confirmed accuracy |
| **Village Data** | Generated the data structure format | Researched and compiled 35 real villages with GPS, population, rainfall from IMD/Census/GSDA |
| **UI Components** | Generated React component code and CSS | Customized theme, added Vidarbha-specific content, designed UX flow |
| **Route Optimization** | Suggested OSRM integration approach | Identified as a problem statement gap, implemented and tested |
| **AI Analyst** | Generated Gemini SDK integration code | Designed the system prompt with full village data injection, wrote fallbacks |
| **Scarcity Plan** | Generated page layout | Researched Maharashtra's 3-cycle framework, 9-step protocol, Paisewari system |
| **Domain Context** | General drought management knowledge | Vidarbha-specific crisis data, government budget figures, water diversion statistics |
| **Testing** | Suggested verification steps | Performed all browser testing, API verification, build validation |

---

## 4. AI-Generated Code Segments in Final Application

### 4.1 Water Stress Index Calculation (`waterStressEngine.js`)
- **AI Contribution:** Formula structure, weight values, and sub-score functions
- **Team Modification:** Added Vidarbha-specific thresholds (critical depth = 15m), NRDWP standards (55 LPCD)

### 4.2 Route Optimization (`routeService.js`)
- **AI Contribution:** OSRM API integration code, GeoJSON parsing, Haversine fallback
- **Team Modification:** Set Nagpur depot coordinates, integrated with tanker allocation UI

### 4.3 Gemini AI Service (`geminiService.js`)
- **AI Contribution:** SDK setup, chat history management, streaming response handling
- **Team Modification:** Wrote the entire system prompt with 35-village data injection, 9-step protocol context, Vidarbha crisis statistics

### 4.4 Firebase Authentication (`AuthContext.jsx`)
- **AI Contribution:** Auth state management, Google Sign-In flow, role selection
- **Team Modification:** Added Firestore role persistence, localStorage fallback

### 4.5 Dashboard Components (All admin pages)
- **AI Contribution:** Component structure, chart configurations, Leaflet map setup
- **Team Modification:** All content, data, village names, alert text, budget figures

---

## 5. Tools & APIs in Final Application

| Tool/API | How It's Used | API Key Required |
|----------|--------------|-----------------|
| **Google Gemini 2.0 Flash** | AI Drought Analyst chatbot + daily briefings | Yes (free tier) |
| **Firebase Auth** | Google Sign-In authentication | Yes (free tier) |
| **Cloud Firestore** | Real-time database for villages, tankers, trips | Yes (free tier) |
| **OpenWeatherMap** | Live weather data for 11 Vidarbha districts | Yes (free tier) |
| **OSRM** | Route optimization for tanker dispatch | No (open source) |
| **Leaflet.js + CartoDB** | GIS mapping and visualization | No (open source) |
| **Recharts** | Data visualization charts | No (open source) |

---

## 6. Ethical AI Usage Declaration

1. **Transparency:** All AI-generated code has been reviewed, understood, and validated by team members before inclusion.
2. **Data Integrity:** Village data, government statistics, and drought context are sourced from official records (IMD, GSDA, Census), not AI-generated.
3. **AI as Tool:** AI was used as a development accelerator — the domain research, problem understanding, and solution design are the team's intellectual contribution.
4. **In-App AI:** The Gemini AI Analyst is clearly labeled as AI-powered in the application UI. Users know they are interacting with an AI system.

---

**Document prepared by Team AXION CORP**
**Date: February 23, 2026**
