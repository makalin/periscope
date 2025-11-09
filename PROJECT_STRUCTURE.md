# Periscope Project Structure

This document provides an overview of the complete Periscope application structure.

## Project Overview

Periscope is a full-stack application for tracking public predictions and verifying outcomes using the Perimeter scoring system.

## Directory Structure

```
periscope/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js 14 App Router
│   │   ├── globals.css       # Global styles with TailwindCSS
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Home page with tabs
│   ├── components/           # React components
│   │   ├── ClaimsList.tsx    # Display list of claims
│   │   ├── CreateClaimForm.tsx # Form to create new claims
│   │   └── Leaderboard.tsx   # Leaderboard display
│   ├── lib/                  # Utility libraries
│   │   └── api.ts            # API client functions
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── tailwind.config.js    # TailwindCSS configuration
│   └── next.config.js        # Next.js configuration
│
├── src/                      # Backend source code
│   ├── db/                   # Database related files
│   │   ├── connection.ts     # PostgreSQL connection pool
│   │   ├── migrate.ts        # Database migration script
│   │   ├── schema.sql        # Database schema definition
│   │   └── seed.ts           # Database seeding script
│   ├── scoring/              # Perimeter scoring engine
│   │   └── perimeter.ts      # Perimeter calculation logic
│   ├── server/               # Fastify API server
│   │   ├── index.ts          # Server entry point
│   │   └── routes/           # API route handlers
│   │       ├── claims.ts     # Claims CRUD endpoints
│   │       ├── health.ts     # Health check endpoint
│   │       └── leaderboard.ts # Leaderboard endpoint
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Shared types and interfaces
│   ├── utils/                # Utility functions
│   │   └── validation.ts     # Validation helpers
│   └── workers/              # Background job workers
│       └── index.ts          # BullMQ worker setup
│
├── package.json              # Root package.json with scripts
├── tsconfig.json             # TypeScript configuration
├── .gitignore                # Git ignore rules
├── README.md                 # Project documentation
├── SETUP.md                  # Setup instructions
└── LICENSE                   # MIT License
```

## Key Components

### Backend (Node.js + Fastify)

1. **API Server** (`src/server/index.ts`)
   - Fastify-based REST API
   - CORS, Helmet, Rate Limiting middleware
   - Health check endpoint

2. **Database Layer** (`src/db/`)
   - PostgreSQL connection pool
   - Schema with 5 main tables:
     - `forecaster` - People making predictions
     - `source` - Original sources (tweets, articles, etc.)
     - `claim` - Predictions and metadata
     - `outcome` - Actual results with Perimeter scores
     - `claim_tag` - Tags and categories

3. **Perimeter Scoring** (`src/scoring/perimeter.ts`)
   - Numeric predictions: Uses domain-specific ranges
   - Categorical predictions: Exact/partial match scoring
   - Probabilistic predictions: Brier score based

4. **API Endpoints**
   - `POST /v1/claims` - Create new claim
   - `GET /v1/claims` - List claims (with filters)
   - `GET /v1/claims/:id` - Get specific claim
   - `POST /v1/claims/:id/resolve` - Resolve claim with outcome
   - `GET /v1/leaderboard` - Get accuracy leaderboard

### Frontend (Next.js + React + TailwindCSS)

1. **Pages** (`frontend/app/`)
   - Home page with tabbed interface
   - Claims list view
   - Leaderboard view
   - Create claim form

2. **Components** (`frontend/components/`)
   - `ClaimsList` - Displays claims with filters
   - `Leaderboard` - Shows forecaster rankings
   - `CreateClaimForm` - Form for creating new claims

3. **API Client** (`frontend/lib/api.ts`)
   - Axios-based API wrapper
   - Type-safe request/response handling

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify
- **Database**: PostgreSQL
- **Queue**: Redis + BullMQ
- **Language**: TypeScript
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **HTTP Client**: Axios

## Database Schema

### Tables

1. **forecaster**
   - Stores information about people/entities making predictions
   - Fields: id, name, username, platform, bio, verified

2. **source**
   - Original sources (tweets, articles, videos)
   - Fields: id, forecaster_id, url, platform, title, content

3. **claim**
   - Predictions with metadata
   - Fields: id, forecaster_id, source_id, text, domain, claim_type, predicted_value/category/probability, status

4. **outcome**
   - Actual results linked to claims
   - Fields: id, claim_id, actual_value/category/probability, perimeter_score

5. **claim_tag**
   - Tags and categories for claims
   - Fields: id, claim_id, tag, tag_type

## Perimeter Scoring Algorithm

The Perimeter metric calculates accuracy scores (0-100):

- **Numeric**: `100 * (1 - |Predicted - Actual| / Range)`
- **Categorical**: 100 if exact match, 50 if partial, 0 otherwise
- **Probabilistic**: `100 * (1 - Brier Score)` where Brier Score = (predicted - actual)²

## Getting Started

See [SETUP.md](./SETUP.md) for detailed installation and setup instructions.

Quick start:
```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Set up database (create DB first)
npm run db:migrate

# Start development servers
npm run dev
```

## API Usage Examples

### Create a Claim
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

### Resolve a Claim
```bash
curl -X POST http://localhost:3001/v1/claims/{claim_id}/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "actual_value": 61.8,
    "data_source": "Bureau of Labor Statistics"
  }'
```

### Get Leaderboard
```bash
curl http://localhost:3001/v1/leaderboard?domain=economy&period=1y
```

## License

MIT License - See [LICENSE](./LICENSE) file

