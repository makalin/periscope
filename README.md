# Periscope

[![CI](https://img.shields.io/github/actions/workflow/status/makalin/periscope/ci.yml?label=CI)](https://github.com/makalin/periscope/actions)
[![License](https://img.shields.io/badge/license-MIT-informational)](#license)
[![Coverage](https://img.shields.io/badge/coverage-—-blueviolet)](https://github.com/makalin/periscope)
[![Made with](https://img.shields.io/badge/made_with-Node.js_%2B_Postgres-1f425f.svg)](#tech-stack)

> Track public predictions (economy, earthquakes, tech, politics), verify outcomes, and score forecasters with a single, transparent accuracy metric: **Perimeter**.

---

## 🌐 Project

**Periscope** — an open-source intelligence app that tracks public predictions across economy, earthquakes, politics, and technology, linking each claim to real-world outcomes.  
Using a custom scoring system called **Perimeter**, it calculates the accuracy and reliability of forecasters through verifiable data and transparent metrics.

🔗 **GitHub Repository:** [github.com/makalin/periscope](https://github.com/makalin/periscope)

---

## ✨ Features

### 📊 Dashboard & Analytics
- **Interactive Dashboard** with real-time metrics and visualizations
- **Key Performance Indicators**: Total claims, resolved claims, average Perimeter score, pending claims
- **Charts & Visualizations**:
  - Claims trend over time (Line Chart)
  - Claims by domain (Bar Chart)
  - Perimeter distribution (Pie Chart)
  - Claims by type (Bar Chart)
  - Top forecasters (Horizontal Bar Chart)
- **Period Filtering**: View data for last 30 days, 90 days, 1 year, or all time
- **Analytics API**: Comprehensive statistics and trend analysis

### 📄 Reports & Export
- **PDF Export**:
  - Full comprehensive reports with statistics, leaderboard, and claims
  - Claims-only reports
  - Leaderboard-only reports
  - Professional formatting with tables, charts, and summaries
- **CSV Export**:
  - Export claims data
  - Export leaderboard data
  - Proper CSV formatting with all relevant fields
- **Report Generation**: Customizable reports with filters by domain, status, and time period

### 🎯 Claims Management
- **Create Claims**: Support for numeric, categorical, and probabilistic predictions
- **View & Filter**: Browse claims with filters by domain, status, and time period
- **Resolve Claims**: Submit actual outcomes to calculate Perimeter scores
- **Export Options**: PDF and CSV export directly from claims view

### 🏆 Leaderboard
- **Forecaster Rankings**: Ranked by Perimeter scores
- **Filtering**: By domain and time period
- **Metrics**: Total claims, resolved claims, average and weighted Perimeter scores
- **Export Options**: PDF and CSV export

### 🎨 User Interface
- **Dark Theme**: Toggle between light and dark modes
- **System Preference Detection**: Automatically detects user's preferred theme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with TailwindCSS and Next.js

---

## ⚙️ Overview

Periscope collects and evaluates **claims** from sources like Twitter/X, YouTube, RSS feeds, or manual entries.  
Each claim is verified against real-world data (e.g., CPI, elections, earthquakes) and assigned a **Perimeter Score (0–100)** measuring its accuracy and credibility.

---

## 🧮 Perimeter Metric

The **Perimeter** metric provides a universal accuracy measure:

```text
Perimeter = 100 * (1 - |Predicted - Actual| / Range)
```

* **Numeric forecasts** use rolling domain-specific ranges (e.g., CPI %, USD/TRY).
* **Categorical claims** use exact/partial match scoring (100 for exact, 50 for partial, 0 for no match).
* **Probabilistic claims** use Brier-style scoring: `100 * (1 - (predicted - actual)²)`.
* **Weighted averages** compute reliability per forecaster, topic, or time period.

### Perimeter Score Ranges
- **Excellent (80-100)**: Highly accurate predictions
- **Good (60-79)**: Good accuracy
- **Fair (40-59)**: Moderate accuracy
- **Poor (0-39)**: Low accuracy

---

## 🗂️ Database Schema

| Table        | Purpose                                 |
| ------------ | --------------------------------------- |
| `forecaster` | Person or entity making the prediction  |
| `source`     | Original source (tweet, article, video) |
| `claim`      | Prediction text and metadata            |
| `outcome`    | Actual results linked to datasets       |
| `claim_tag`  | Keywords, topics, or regions            |

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable
- **Date Handling**: date-fns
- **HTTP Client**: Axios

### Backend
- **Framework**: Fastify
- **Database**: PostgreSQL
- **Queue/Workers**: Redis + BullMQ
- **Validation**: Zod
- **Language**: TypeScript

### Evaluation
- **Scoring Engine**: Custom Perimeter calculation
- **Domain-Specific Ranges**: Configurable ranges per domain
- **Weighted Averages**: Time-weighted and importance-weighted scoring

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/makalin/periscope.git
   cd periscope
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your database and Redis credentials
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb periscope
   
   # Run migrations
   npm run db:migrate
   ```

5. **Start Redis**
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

6. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Terminal 1: Backend
   npm run dev:server
   
   # Terminal 2: Frontend
   npm run dev:client
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

For detailed setup instructions, see [SETUP.md](./SETUP.md).

---

## 🧩 API Endpoints

### Claims
| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `POST` | `/v1/claims`             | Add a new prediction                      |
| `GET`  | `/v1/claims`             | List claims (with filters)                |
| `GET`  | `/v1/claims/:id`         | Get specific claim                        |
| `POST` | `/v1/claims/:id/resolve` | Submit real outcome and compute Perimeter |

### Leaderboard
| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `GET`  | `/v1/leaderboard`        | Retrieve accuracy ranking                 |

### Analytics
| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `GET`  | `/v1/analytics`          | Get analytics and statistics              |
| `GET`  | `/v1/analytics/trends`   | Get trend data over time                  |

### Health
| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `GET`  | `/health`                | Health check endpoint                     |

---

## 🧠 Example Workflow

### 1. Create a Claim
```bash
curl -X POST http://localhost:3001/v1/claims \
  -H "Content-Type: application/json" \
  -d '{
    "text": "CPI will reach 62% in October",
    "domain": "economy",
    "claim_type": "numeric",
    "predicted_value": 62,
    "forecaster_name": "John Economist",
    "forecaster_username": "johnecon"
  }'
```

### 2. Resolve a Claim
```bash
curl -X POST http://localhost:3001/v1/claims/{claim_id}/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "actual_value": 61.8,
    "data_source": "Bureau of Labor Statistics"
  }'
```

### 3. Get Leaderboard
```bash
curl http://localhost:3001/v1/leaderboard?domain=economy&period=1y
```

### 4. Get Analytics
```bash
curl http://localhost:3001/v1/analytics?domain=economy&period=1y
```

---

## 📊 Export & Reports

### PDF Export
Generate professional PDF reports with:
- Statistics summary
- Leaderboard tables
- Claims listings
- Charts and visualizations
- Customizable filters

### CSV Export
Export data for analysis in spreadsheet applications:
- All claim fields
- Leaderboard rankings
- Timestamped filenames
- Proper CSV formatting

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Run both server and client
npm run dev:server      # Run backend server only
npm run dev:client      # Run frontend client only

# Build
npm run build           # Build both server and client
npm run build:server    # Build backend only
npm run build:client    # Build frontend only

# Production
npm start               # Start production server

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking
```

### Project Structure

```
periscope/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   └── lib/           # Utility libraries (API, PDF, CSV, analytics)
├── src/               # Backend source code
│   ├── db/            # Database schema and migrations
│   ├── scoring/       # Perimeter scoring engine
│   ├── server/         # Fastify API server
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── workers/        # Background job workers
└── package.json        # Root package configuration
```

For detailed project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and installation guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure and architecture
- [FEATURES.md](./FEATURES.md) - Complete feature documentation

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 📊 Roadmap

### Completed ✅
- [x] Core claims management
- [x] Perimeter scoring system
- [x] Leaderboard functionality
- [x] Dashboard with charts
- [x] PDF export functionality
- [x] CSV export functionality
- [x] Analytics API endpoints
- [x] Dark theme support
- [x] Reports generation

### In Progress 🚧
- [ ] Auto-ingest from verified experts (X, YouTube, RSS)
- [ ] Unit and integration tests
- [ ] API documentation (OpenAPI/Swagger)

### Planned 📋
- [ ] Confidence calibration and topic weighting
- [ ] Open "Perimeter API" for media and researchers
- [ ] Scheduled report generation
- [ ] Email report delivery
- [ ] Advanced filtering and search
- [ ] Claim comparison tools
- [ ] Forecaster profiles
- [ ] Real-time notifications
- [ ] Export to Excel format

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👤 Credits

**Author:** [Mehmet T. Akalın](https://github.com/makalin)  
**GitHub:** [github.com/makalin/periscope](https://github.com/makalin/periscope)

> Blending data, AI, and social accountability into one open prediction intelligence framework.

---

© 2025 Mehmet T. Akalın — All rights reserved.
